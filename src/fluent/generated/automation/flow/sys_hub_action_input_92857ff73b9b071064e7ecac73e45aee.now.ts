import { Record } from '@servicenow/sdk/core'

Record({
    $id: Now.ID['92857ff73b9b071064e7ecac73e45aee'],
    table: 'sys_hub_action_input',
    data: {
        active: 'true',
        array: 'false',
        attributes:
            'element_mapping_provider=com.glide.flow_design.action.data.FlowDesignVariableMapper,uiType=string,uiTypeLabel=String,uiUniqueId=a89932d4-6691-42e1-90f1-cf7e64a4bdbe',
        audit: 'false',
        calculation: `(function calculatedFieldValue(current) {

	// Add your code here
	return '';  // return the calculated value

})(current);`,
        display: 'false',
        dynamic_creation: 'false',
        element: 'model',
        element_reference: 'false',
        function_field: 'false',
        internal_type: 'string',
        label: 'model',
        mandatory: 'false',
        max_length: '8000',
        model: 'da857ff73b9b071064e7ecac73e45ae6',
        model_id: 'da857ff73b9b071064e7ecac73e45ae6',
        model_table: 'sys_hub_action_type_snapshot',
        name: 'var__m_sys_hub_action_input_da857ff73b9b071064e7ecac73e45ae6',
        order: '1',
        primary: 'false',
        read_only: 'false',
        reference_floats: 'false',
        spell_check: 'false',
        staged: 'false',
        table_reference: 'false',
        text_index: 'false',
        unique: 'false',
        use_dependent_field: 'false',
        use_dynamic_default: 'false',
        use_reference_qualifier: 'simple',
        virtual: 'false',
        virtual_type: 'script',
        xml_view: 'false',
    },
})
