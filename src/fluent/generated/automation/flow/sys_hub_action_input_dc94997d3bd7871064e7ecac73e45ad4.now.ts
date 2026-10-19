import { Record } from '@servicenow/sdk/core'

Record({
    $id: Now.ID['dc94997d3bd7871064e7ecac73e45ad4'],
    table: 'sys_hub_action_input',
    data: {
        active: 'true',
        array: 'false',
        attributes:
            'element_mapping_provider=com.glide.flow_design.action.data.FlowDesignVariableMapper,uiType=string,uiTypeLabel=String,uiUniqueId=eb7f3f7e-82e2-4b12-a9c0-4ad287f2b41f',
        audit: 'false',
        calculation: `(function calculatedFieldValue(current) {

	// Add your code here
	return '';  // return the calculated value

})(current);`,
        display: 'false',
        dynamic_creation: 'false',
        element: 'cooking_request',
        element_reference: 'false',
        function_field: 'false',
        internal_type: 'string',
        label: 'cooking_request',
        mandatory: 'false',
        max_length: '8000',
        model: 'c494997d3bd7871064e7ecac73e45ac6',
        model_id: 'c494997d3bd7871064e7ecac73e45ac6',
        model_table: 'sys_hub_action_type_snapshot',
        name: 'var__m_sys_hub_action_input_c494997d3bd7871064e7ecac73e45ac6',
        order: '2',
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
