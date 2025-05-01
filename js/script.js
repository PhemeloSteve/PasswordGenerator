function generatePassword(length, includeUppercase, includeLowercase, includeNumbers, includeSymbols) {
    let characters = '';
    if (includeUppercase) characters += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeLowercase) characters += 'abcdefghijklmnopqrstuvwxyz';
    if (includeNumbers) characters += '0123456789';
    if (includeSymbols) characters += '!@#$%^&*()_+=-`~[]\{}|;\':",./<>?';

    let password = '';
    if (characters.length === 0) return password; // Prevent error if no character type is selected

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        password += characters.charAt(randomIndex);
    }
    return password;
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        // Optional: Provide feedback to the user that the password has been copied
        alert('Password copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
}

function generatePasswords() {
    const passwordLengthInput = document.getElementById('passwordLength');
    const uppercaseCheckbox = document.getElementById('uppercase');
    const lowercaseCheckbox = document.getElementById('lowercase');
    const numbersCheckbox = document.getElementById('numbers');
    const symbolsCheckbox = document.getElementById('symbols');
    const passwordOutputDiv = document.getElementById('passwordOutput');

    const length = parseInt(passwordLengthInput.value);
    const includeUppercase = uppercaseCheckbox.checked;
    const includeLowercase = lowercaseCheckbox.checked;
    const includeNumbers = numbersCheckbox.checked;
    const includeSymbols = symbolsCheckbox.checked;

    if (isNaN(length) || length < 1) {
        alert('Please enter a valid password length.');
        return;
    }

    // Generate multiple password forms (you can adjust the number as needed)
    let outputHTML = '';
    for (let i = 0; i < 3; i++) { // Generate 3 password fields
        const password = generatePassword(length, includeUppercase, includeLowercase, includeNumbers, includeSymbols);
        outputHTML += `
            <div class="password-container">
                <input type="text" class="form-control" value="${password}" readonly>
                <button class="btn btn-outline-secondary" type="button" onclick="copyToClipboard('${password}')">
                    <i class="fa fa-clipboard"></i>
                </button>
            </div>
        `;
    }

    passwordOutputDiv.innerHTML = outputHTML;
}