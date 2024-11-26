document.addEventListener('DOMContentLoaded', function() {
    const roleSelect = document.querySelector('#id_role');
    const companyField = document.querySelector('#id_company').closest('.form-row');

    function toggleCompanyField() {
        const selectedRole = roleSelect.value;
        if (selectedRole === 'AGRONOMIST' || selectedRole === 'FARMER') {
            companyField.style.display = 'block';
        } else {
            companyField.style.display = 'none';
        }
    }

    roleSelect.addEventListener('change', toggleCompanyField);
    toggleCompanyField(); // Initial state
}); 