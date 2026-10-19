import { Record } from '@servicenow/sdk/core'

Record({
    $id: Now.ID['0241dd713bd7871064e7ecac73e45ad2'],
    table: 'sys_hub_action_output',
    data: {
        active: 'true',
        array: 'false',
        attributes:
            'action_error_output=true,element_mapping_provider=com.glide.flow_design.action.data.FlowDesignVariableMapper,uiType=boolean,uiTypeLabel=True/False,uiUniqueId=ae84c7c6-b866-46d2-ae60-dd2cfee9b828,visible_in_ui=false',
        audit: 'false',
        calculation: `(function calculatedFieldValue(current) {

	// Add your code here
	return '';  // return the calculated value

})(current);`,
        default_value: 'true',
        display: 'false',
        dynamic_creation: 'false',
        element: '__dont_treat_as_error__',
        element_reference: 'false',
        function_field: 'false',
        internal_type: 'boolean',
        label: "Don't Treat as Error",
        mandatory: 'false',
        max_length: '40',
        model: 'f541dd713bd7871064e7ecac73e45a38',
        model_id: 'f541dd713bd7871064e7ecac73e45a38',
        model_table: 'sys_hub_action_type_snapshot',
        name: 'var__m_sys_hub_action_output_f541dd713bd7871064e7ecac73e45a38',
        order: '3',
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
