// Dark mode toggle
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    // Optionally persist preference
    if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('darkMode', 'enabled');
    } else {
        localStorage.setItem('darkMode', 'disabled');
    }
}

// On page load, set dark mode if previously enabled
document.addEventListener('DOMContentLoaded', function() {
    loadPasswordHistory();
    const passwordInput = document.getElementById('generatedPassword');
    passwordInput.addEventListener('input', function() {
        updateStrengthBar(passwordInput.value);
        updateBruteForceTime(passwordInput.value);
    });
    // Dark mode preference
    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-mode');
        const toggle = document.getElementById('darkModeToggle');
        if (toggle) toggle.checked = true;
    }
});
function generatePassword(length, includeUppercase, includeLowercase, includeNumbers, includeSymbols) {
    let characters = '';
    if (includeUppercase) characters += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeLowercase) characters += 'abcdefghijklmnopqrstuvwxyz';
    if (includeNumbers) characters += '0123456789';
    if (includeSymbols) characters += '!@#$%^&*()_+=-`~[]\{}|;\':",./<>?';

    let password = ''; 
    if (characters.length === 0) return password; 
    
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        password += characters.charAt(randomIndex);
    }
    return password;
}

    // Password strength checker (simple version, can be replaced with zxcvbn)
    function getPasswordStrength(password) {
        let score = 0;
        if (!password) return {score: 0, feedback: 'Enter a password.'};
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        let feedback = '';
        if (score <= 2) feedback = 'Weak: Add more character types and length.';
        else if (score === 3) feedback = 'Medium: Add more variety.';
        else if (score >= 4) feedback = 'Strong password!';
        return {score, feedback};
    }

    // Brute-force time calculator
    function calculateBruteForceTime(password) {
        let charsetSize = 0;
        if (/[A-Z]/.test(password)) charsetSize += 26;
        if (/[a-z]/.test(password)) charsetSize += 26;
        if (/[0-9]/.test(password)) charsetSize += 10;
        if (/[^A-Za-z0-9]/.test(password)) charsetSize += 33;
        if (!charsetSize) return 'N/A';
        const attemptsPerSecond = 1e10;
        const possiblePasswords = Math.pow(charsetSize, password.length);
        const seconds = possiblePasswords / attemptsPerSecond;
        if (seconds < 60) return `${seconds.toFixed(2)} seconds`;
        if (seconds < 3600) return `${(seconds/60).toFixed(2)} minutes`;
        if (seconds < 86400) return `${(seconds/3600).toFixed(2)} hours`;
        if (seconds < 31536000) return `${(seconds/86400).toFixed(2)} days`;
        if (seconds < 3153600000) return `${(seconds/31536000).toFixed(2)} years`;
        return `${(seconds/3153600000).toFixed(2)} centuries`;
    }

    // Secure password history with encryption
let masterPassword = null;
let passwordHistory = [];

// Function to derive encryption key from master password
async function deriveKey(password) {
    const salt = new TextEncoder().encode('PasswordGeneratorSalt');
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
    );
    
    return await crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: 100000,
            hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
    );
}

// Encrypt data
async function encryptData(data, key) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(JSON.stringify(data));
    
    const ciphertext = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        encoded
    );
    
    return {
        ciphertext: Array.from(new Uint8Array(ciphertext)),
        iv: Array.from(iv)
    };
}

// Decrypt data
async function decryptData(encrypted, key) {
    try {
        const decrypted = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: new Uint8Array(encrypted.iv) },
            key,
            new Uint8Array(encrypted.ciphertext)
        );
        return JSON.parse(new TextDecoder().decode(decrypted));
    } catch (error) {
        console.error('Decryption failed');
        return null;
    }
}

// Save password to encrypted history
async function savePasswordToHistory(password) {
    try {
        if (!masterPassword) {
            const userInput = await promptMasterPassword('set');
            if (!userInput) return;
            masterPassword = userInput;
        }

        const now = new Date();
        const entry = {
            password,
            date: now.toLocaleString(),
            timestamp: now.getTime()
        };

        passwordHistory.unshift(entry);
        if (passwordHistory.length > 10) {
            passwordHistory.pop();
        }

        const key = await deriveKey(masterPassword);
        const encrypted = await encryptData(passwordHistory, key);
        localStorage.setItem('encryptedHistory', JSON.stringify(encrypted));
    } catch (error) {
        console.error('Failed to save password to history:', error);
        alert('Failed to save password to history. Please try again.');
    }
}

// Load password history with decryption
async function loadPasswordHistory() {
    try {
        const encrypted = localStorage.getItem('encryptedHistory');
        if (!encrypted) {
            passwordHistory = [];
            return;
        }

        if (!masterPassword) {
            const userInput = await promptMasterPassword('access');
            if (!userInput) return;
            masterPassword = userInput;
        }

        const key = await deriveKey(masterPassword);
        const decrypted = await decryptData(JSON.parse(encrypted), key);
        
        if (decrypted) {
            passwordHistory = decrypted;
            passwordHistory.sort((a, b) => b.timestamp - a.timestamp);
        } else {
            alert('Incorrect master password');
            masterPassword = null;
            passwordHistory = [];
        }
    } catch (error) {
        console.error('Failed to load password history:', error);
        passwordHistory = [];
    }
}

// Prompt for master password
function promptMasterPassword(action) {
    return new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.className = 'modal fade show';
        modal.style.display = 'block';
        modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
        
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Master Password Required</h5>
                    </div>
                    <div class="modal-body">
                        <p class="text-warning">
                            <i class="fa fa-exclamation-triangle"></i> 
                            Security Notice: This is a basic encryption implementation. 
                            For truly sensitive data, please use a dedicated password manager.
                        </p>
                        <p>Enter master password to ${action} password history:</p>
                        <input type="password" id="masterPasswordInput" class="form-control" 
                               minlength="8" required>
                        <small class="text-muted">
                            Master password must be at least 8 characters long
                        </small>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" id="cancelBtn">Cancel</button>
                        <button type="button" class="btn btn-primary" id="submitBtn">Submit</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const input = modal.querySelector('#masterPasswordInput');
        const submitBtn = modal.querySelector('#submitBtn');
        const cancelBtn = modal.querySelector('#cancelBtn');
        
        input.focus();
        
        input.addEventListener('keyup', (e) => {
            if (e.key === 'Enter' && input.value.length >= 8) {
                submitBtn.click();
            }
        });
        
        submitBtn.addEventListener('click', () => {
            const value = input.value;
            if (value.length < 8) {
                alert('Master password must be at least 8 characters long');
                return;
            }
            modal.remove();
            resolve(value);
        });
        
        cancelBtn.addEventListener('click', () => {
            modal.remove();
            resolve(null);
        });
    });
}
    function showPasswordHistory() {
        loadPasswordHistory();
        let historyHtml = `
            <div class="modal-content bg-light p-4">
                <h5 class="mb-4">Password History (Last 10)</h5>
                ${passwordHistory.length === 0 ? 
                    '<p class="text-muted">No passwords saved yet.</p>' :
                    `<div class="list-group">
                        ${passwordHistory.map((item, idx) => `
                            <div class="list-group-item">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <span class="password-text">${item.password}</span>
                                        <br>
                                        <small class="text-muted">${item.date}</small>
                                    </div>
                                    <div class="btn-group">
                                        <button class="btn btn-sm btn-outline-primary" onclick="copyToClipboard('${item.password}')">
                                            <i class="fa fa-copy"></i> Copy
                                        </button>
                                        <button class="btn btn-sm btn-outline-danger" onclick="deleteHistoryPassword(${idx})">
                                            <i class="fa fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>`
                }`;
        const div = document.createElement('div');
        div.innerHTML = historyHtml;
        div.style.position = 'fixed';
        div.style.top = '10%';
        div.style.left = '50%';
        div.style.transform = 'translateX(-50%)';
        div.style.background = '#fff';
        div.style.padding = '20px';
        div.style.zIndex = '9999';
        div.style.borderRadius = '10px';
        div.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
        div.id = 'historyModal';
        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'Close';
        closeBtn.className = 'btn btn-dark mt-2';
        closeBtn.onclick = () => div.remove();
        div.appendChild(closeBtn);
        document.body.appendChild(div);
    }
    function deleteHistoryPassword(idx) {
        passwordHistory.splice(idx, 1);
        localStorage.setItem('passwordHistory', JSON.stringify(passwordHistory));
        document.getElementById('historyModal').remove();
        showPasswordHistory();
    }

    // Copy password to clipboard
    function copyPassword() {
        const password = document.getElementById('generatedPassword').value;
        copyToClipboard(password);
    }
    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            alert('Password copied to clipboard!');
        });
    }

    // Generate password and update UI
    function generatePasswords() {
        const length = parseInt(document.getElementById('passwordLength').value);
        const includeUppercase = document.getElementById('uppercase').checked;
        const includeLowercase = document.getElementById('lowercase').checked;
        const includeNumbers = document.getElementById('numbers').checked;
        const includeSymbols = document.getElementById('symbols').checked;

        // Check if at least one character type is selected
        if (!includeUppercase && !includeLowercase && !includeNumbers && !includeSymbols) {
            alert('Please select at least one character type.');
            return;
        }

        // Validate password length
        if (isNaN(length) || length < 8 || length > 25) {
            alert('Please enter a valid password length between 8 and 25.');
            return;
        }

        // Generate and display the password
        const password = generatePassword(length, includeUppercase, includeLowercase, includeNumbers, includeSymbols);
        
        // Update the generated password field
        const generatedPasswordInput = document.getElementById('generatedPassword');
        generatedPasswordInput.value = password;
        generatedPasswordInput.select(); // Select the password for easy copying

        // Update the strength and brute force indicators
        updateStrengthBar(password);
        updateBruteForceTime(password);

        // Save to history
        savePasswordToHistory(password);

        // Show success message on the button
        const generateBtn = document.querySelector('button[onclick="generatePasswords()"]');
        const originalText = generateBtn.textContent;
        generateBtn.textContent = '✓ Password Generated!';
        generateBtn.classList.add('btn-success');
        setTimeout(() => {
            generateBtn.textContent = originalText;
            generateBtn.classList.remove('btn-success');
        }, 1500);
    }

    // Live update strength bar and brute-force time
    function updateStrengthBar(password) {
        const {score, feedback} = getPasswordStrength(password);
        const bar = document.getElementById('strengthBar');
        const feedbackEl = document.getElementById('strengthFeedback');
        let percent = (score/5)*100;
        bar.style.width = percent + '%';
        bar.textContent = feedback;
        if (score <= 2) bar.className = 'progress-bar bg-danger';
        else if (score === 3) bar.className = 'progress-bar bg-warning';
        else bar.className = 'progress-bar bg-success';
        feedbackEl.textContent = feedback;
    }
    function updateBruteForceTime(password) {
        document.getElementById('bruteForceTime').textContent = calculateBruteForceTime(password);
    }


