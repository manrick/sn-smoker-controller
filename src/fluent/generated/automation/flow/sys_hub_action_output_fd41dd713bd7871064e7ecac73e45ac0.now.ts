import { Record } from '@servicenow/sdk/core'

Record({
    $id: Now.ID['fd41dd713bd7871064e7ecac73e45ac0'],
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
        model: 'f541dd713bd7871064e7ecac73e45a38',
        model_id: 'f541dd713bd7871064e7ecac73e45a38',
        model_table: 'sys_hub_action_type_snapshot',
        name: 'var__m_sys_hub_action_output_f541dd713bd7871064e7ecac73e45a38',
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
