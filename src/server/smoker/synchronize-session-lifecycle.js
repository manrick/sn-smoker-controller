/* global current, GlideDateTime */

var phaseByStatus = {
    planned: 'planned',
    preheating: 'preheating',
    cooking: 'cooking',
    holding: current.getValue('current_phase') === 'post-target hold' ? 'post-target hold' : 'holding',
    completed: 'finished',
    stopped: 'stopped',
    fault: 'fault'
};
var status = current.getValue('status');
var phase = phaseByStatus[status];
var monitorsMeat = current.getValue('monitor_meat_temperature') === '1' || current.getValue('monitor_meat_temperature') === 'true';
var completedField = monitorsMeat ? 'post_target_completed_at' : 'chamber_target_completed_at';

if (phase) current.setValue('current_phase', phase);
if (status === 'completed') {
    if (!current.getValue('completed_at')) current.setValue('completed_at', new GlideDateTime());
    if (!current.getValue(completedField)) current.setValue(completedField, new GlideDateTime());
} else {
    current.setValue('completed_at', '');
    current.setValue(completedField, '');
}