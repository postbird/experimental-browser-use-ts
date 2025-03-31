Here is the user's instruction:
<instruction>
{{instruction}}
</instruction>

These are the logs from previous executions, which indicate what was done in the previous actions.
Do NOT repeat these actions.
<previous_logs>
{% for log in previousLogs %}
{{ loop.index }}. {{ log }}
{% endfor %}
</previous_logs>