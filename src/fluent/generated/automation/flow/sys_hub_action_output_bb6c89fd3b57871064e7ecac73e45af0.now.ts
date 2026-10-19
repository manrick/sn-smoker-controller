import { Record } from '@servicenow/sdk/core'

Record({
    $id: Now.ID['bb6c89fd3b57871064e7ecac73e45af0'],
    table: 'sys_hub_action_output',
    data: {
        active: 'true',
        array: 'false',
        attributes:
            'action_error_output=true,co_type_name=FDACTIONSTATUS,element_mapping_provider=com.glide.flow_design.action.data.FlowDesignVariableMapper,uiType=object,uiTypeLabel=Object,uiUniqueId=0adddc13-456e-4ad6-a78f-a67f4b159046',
        audit: 'false',
        calculation: `(function calculatedFieldValue(current) {

	// Add your code here
	return '';  // return the calculated value

})(current);`,
        display: 'false',
        dynamic_creation: 'false',
        element: '__action_status__',
        element_reference: 'false',
        function_field: 'false',
        internal_type: 'string',
        label: 'Action Status',
        mandatory: 'false',
        max_length: '65000',
        model: '854ccdbd3b57871064e7ecac73e45a70',
        model_id: '854ccdbd3b57871064e7ecac73e45a70',
        model_table: 'sys_hub_action_type_definition',
        name: 'var__m_sys_hub_action_output_854ccdbd3b57871064e7ecac73e45a70',
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
