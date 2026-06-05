Dear {{ candidate_name }},

As part of the {{assessment_quarter}} assessment cycle, your technical assessment has been completed.
Below is a summary of the evaluation results including proficiency level, key strengths and development areas.

### 1. Overall Assessment Result

- **Assessment Date:** {{ assessment_date }}
- **Profile:** {{ target_profile_name }} ({{ target_technology_stack }})
- **Proficiency Level:** {{ summary.proficiency_level }}

{{ summary.description }}

### 2. Key Strengths

The following areas were identified as strong competencies aligned with the Technical Matrix:

{% for key_strength in summary.key_strengths %}
- **{{ key_strength.competency }}:** {{ key_strength.description }}
{% endfor %}

These strengths reflect consistent performance and positive contribution to team and project outcomes.

### 3. Development Areas

The following competencies present opportunities for further growth:

{% for development_area in summary.development_areas %}
- **{{ development_area.competency }}:** {{ development_area.description }}
{% endfor %}

To progress toward the next proficiency level, focus should be placed on demonstrating behaviors aligned with {{summary.proficiency_level}} proficiency level.

### 4. Recommended Learning Resources

{% for recommended_resource in summary.recommended_resources %}
- **{{ recommended_resource.resource }}**: {{ recommended_resource.description }}
{% endfor %}

### 5. Next Steps

{% for development_action in summary.development_actions %}
- **{{ development_action.action }}**: {{ development_action.description }}
{% endfor %}

The results have been reviewed and validated through the company’s assessment calibration process to ensure consistency and objectivity across roles and teams. If you would like to discuss any part of the evaluation in more detail, please coordinate a follow-up discussion with your manager or HR partner.
