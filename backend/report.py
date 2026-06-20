import os
from io import BytesIO
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.graphics.shapes import Drawing, Rect

def generate_pdf_report(inputs, predicted_species, confidence, model_name, shap_values):
    """
    Generates a professional PDF report and returns it as a bytes object.
    """
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=54,
        leftMargin=54,
        topMargin=54,
        bottomMargin=54
    )
    
    # Styles
    styles = getSampleStyleSheet()
    
    # Custom Palette
    primary_color = colors.HexColor('#06b6d4')   # Cyan
    secondary_color = colors.HexColor('#6366f1') # Indigo
    dark_neutral = colors.HexColor('#0f172a')    # Dark Slate
    light_bg = colors.HexColor('#f8fafc')        # Slate 50
    border_color = colors.HexColor('#e2e8f0')    # Slate 200
    
    # Custom Typography styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=primary_color
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#64748b')
    )
    
    h1_style = ParagraphStyle(
        'SectionHeading',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=secondary_color,
        spaceBefore=15,
        spaceAfter=8
    )
    
    body_style = ParagraphStyle(
        'BodyTextCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=dark_neutral
    )
    
    body_bold_style = ParagraphStyle(
        'BodyTextBoldCustom',
        parent=body_style,
        fontName='Helvetica-Bold'
    )
    
    footer_style = ParagraphStyle(
        'FooterText',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=8,
        leading=10,
        textColor=colors.HexColor('#94a3b8'),
        alignment=1 # Centered
    )

    story = []
    
    # 1. Header
    story.append(Paragraph("IrisVision AI", title_style))
    story.append(Paragraph("Model Inference & Explainability Report", subtitle_style))
    story.append(Spacer(1, 15))
    
    # Decorative line
    line_drawing = Drawing(504, 2)
    line_drawing.add(Rect(0, 0, 504, 2, fillColor=primary_color, strokeColor=None))
    story.append(line_drawing)
    story.append(Spacer(1, 15))
    
    # 2. Metadata Block (2 column key-value table)
    meta_data = [
        [
            Paragraph("<b>Predicted Species:</b>", body_style), 
            Paragraph(predicted_species.replace("Iris-", "").capitalize(), body_bold_style),
            Paragraph("<b>Analysis Date:</b>", body_style),
            Paragraph(datetime.now().strftime("%Y-%m-%d %H:%M:%S"), body_style)
        ],
        [
            Paragraph("<b>Confidence Score:</b>", body_style),
            Paragraph(f"{confidence * 100:.2f}%", body_bold_style),
            Paragraph("<b>Classification Model:</b>", body_style),
            Paragraph(model_name, body_style)
        ]
    ]
    meta_table = Table(meta_data, colWidths=[120, 132, 110, 142])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), light_bg),
        ('BOX', (0,0), (-1,-1), 1, border_color),
        ('PADDING', (0,0), (-1,-1), 8),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 15))
    
    # 3. Specimen Input Dimensions
    story.append(Paragraph("Specimen Measurements", h1_style))
    story.append(Paragraph("The physically measured variables of the classified flower specimen:", body_style))
    story.append(Spacer(1, 8))
    
    measurements_data = [
        [Paragraph("<b>Feature</b>", body_bold_style), Paragraph("<b>Input Value (cm)</b>", body_bold_style)]
    ]
    
    feature_mapping = {
        "sepal_length": "Sepal Length",
        "sepal_width": "Sepal Width",
        "petal_length": "Petal Length",
        "petal_width": "Petal Width"
    }
    
    for key, name in feature_mapping.items():
        val = inputs.get(key, 0.0)
        measurements_data.append([
            Paragraph(name, body_style),
            Paragraph(f"{val:.2f} cm", body_style)
        ])
        
    meas_table = Table(measurements_data, colWidths=[252, 252])
    meas_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('PADDING', (0,0), (-1,-1), 6),
        ('GRID', (0,0), (-1,-1), 0.5, border_color),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, light_bg]),
    ]))
    # Quick fix for headers color in platypus paragraph
    for i in range(2):
        measurements_data[0][i].style.textColor = colors.white
    story.append(meas_table)
    story.append(Spacer(1, 15))
    
    # 4. Model Explainability (SHAP)
    story.append(Paragraph("Model Explainability (SHAP Analysis)", h1_style))
    story.append(Paragraph(
        "SHAP (SHapley Additive exPlanations) attributes the contribution of each feature to the model's prediction. "
        "Positive values (blue) push the prediction probability higher for the target species, while negative values (red) pull it lower.",
        body_style
    ))
    story.append(Spacer(1, 8))
    
    # Function to create vector SHAP bar
    def create_shap_bar(shap_val):
        d = Drawing(100, 10)
        # normalize: max expected SHAP value around 0.5
        w = int(abs(shap_val) / 0.5 * 80)
        w = max(2, min(w, 80))
        bar_color = colors.HexColor('#06b6d4') if shap_val >= 0 else colors.HexColor('#ef4444')
        d.add(Rect(0, 1, w, 8, fillColor=bar_color, strokeColor=None))
        return d
        
    shap_data = [
        [
            Paragraph("<b>Feature</b>", body_bold_style),
            Paragraph("<b>SHAP Value</b>", body_bold_style),
            Paragraph("<b>Attribution Trend</b>", body_bold_style),
            Paragraph("<b>Relative Impact</b>", body_bold_style)
        ]
    ]
    
    # Set headers textColor to white
    for i in range(4):
        shap_data[0][i].style.textColor = colors.white
        
    # Extract SHAP values for the predicted species
    class_shaps = shap_values.get(predicted_species, {})
    
    for feat_name, val in class_shaps.items():
        trend = "Positive (Supports classification)" if val >= 0 else "Negative (Opposes classification)"
        shap_data.append([
            Paragraph(feat_name, body_style),
            Paragraph(f"{val:+.4f}", body_style),
            Paragraph(trend, body_style),
            create_shap_bar(val)
        ])
        
    shap_table = Table(shap_data, colWidths=[120, 80, 204, 100])
    shap_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), secondary_color),
        ('PADDING', (0,0), (-1,-1), 6),
        ('GRID', (0,0), (-1,-1), 0.5, border_color),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, light_bg]),
    ]))
    story.append(shap_table)
    story.append(Spacer(1, 20))
    
    # 5. Model Overview
    story.append(Paragraph("Decision Logic & Insights", h1_style))
    
    # Custom explanation text based on inputs
    petal_len = inputs.get("petal_length", 0.0)
    petal_wid = inputs.get("petal_width", 0.0)
    
    if predicted_species == "Iris-setosa":
        insight_text = (
            "The specimen's petal length and width are extremely small (below 2.0 cm and 0.8 cm respectively). "
            "In decision boundaries, Iris-setosa is linearly separable from other species due to these minuscule petal dimensions, "
            "as clearly reflected in the high positive SHAP values for Petal Length."
        )
    elif predicted_species == "Iris-versicolor":
        insight_text = (
            "The specimen has moderate petal measurements. Because it has medium-sized characteristics, "
            "it is separated from Setosa, but has small enough features to distinguish it from the larger Virginica. "
            "The model confidence reflects the proximity to the decision border separating Versicolor from Virginica."
        )
    else: # Virginica
        insight_text = (
            "The specimen showcases long and wide petals (Petal Length > 4.8 cm, Petal Width > 1.7 cm). "
            "These robust dimensions strongly trigger the activation weights associated with Iris-virginica, "
            "overcoming the other features' influences."
        )
        
    story.append(Paragraph(insight_text, body_style))
    story.append(Spacer(1, 30))
    
    # Decorative line before footer
    story.append(line_drawing)
    story.append(Spacer(1, 10))
    
    # 6. Footer
    story.append(Paragraph("This document was generated automatically by the IrisVision AI decision engine.", footer_style))
    story.append(Paragraph("Explore more analytics at http://localhost:3000 | Developer Portfolio System", footer_style))
    
    # Build document
    doc.build(story)
    
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
