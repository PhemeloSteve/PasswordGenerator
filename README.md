## 🔑 PasswordGenerator

A comprehensive web application that generates secure passwords with customizable options, provides detailed security analysis, and includes a secure password history feature. The application offers real-time password strength assessment and brute-force attack time estimation.

## ✨ Features

### Password Generation
* Interactive slider for password length (8-25 characters)
* Customizable character sets:
  - Uppercase letters (A-Z)
  - Lowercase letters (a-z)
  - Numbers (0-9)
  - Special characters (!@#$%^&* etc.)
* One-click copy to clipboard functionality
* Visual feedback on password generation

### Security Analysis
* Real-time password strength indicator with color-coded feedback
* Detailed strength assessment based on:
  - Password length
  - Character variety
  - Pattern complexity
* Brute-force attack time estimation using modern computing capabilities
* Live updates as you type or generate passwords

### Secure Password History
* Encrypted storage of recent passwords using AES-GCM encryption
* Master password protection with PBKDF2 key derivation
* Stores up to 10 most recent passwords
* Secure viewing and management of password history
* Protected against unauthorized access

### User Interface
* Clean, intuitive design
* Mobile-responsive layout
* Dark mode support
* Accessibility features
* Bootstrap-based modern interface

## 🛠️ Technologies Used

* **Frontend Framework**:
  - HTML5
  - CSS3 with Bootstrap 5
  - JavaScript (ES6+)
* **Security**:
  - Web Crypto API for encryption
  - AES-GCM encryption
  - PBKDF2 key derivation
* **Storage**: 
  - Encrypted LocalStorage
  - Secure state management
* **UI Components**:
  - Bootstrap 5 components
  - CSS Grid and Flexbox
  - Font Awesome icons
* **Dependencies**:
  - Bootstrap 5.3.0
  - Font Awesome 5.15.4

## 🚀 Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/PhemeloSteve/PasswordGenerator
   ```

2. Navigate to the project directory:
   ```bash
   cd PasswordGenerator
   ```

3. Open the project:
   - Option 1: Use a local development server (recommended)
     ```bash
     # Using Python 3
     python -m http.server 8000
     # Or using Node.js's http-server
     npx http-server
     ```
   - Option 2: Open `index.html` directly in your browser

4. Access the application:
   - If using a server: Open `http://localhost:8000` in your browser
   - If opening directly: Double-click `index.html`

## 🔒 Security Considerations

1. **Password Storage**:
   - All stored passwords are encrypted using AES-GCM
   - Master password is never stored, only used for key derivation
   - Uses secure random number generation for cryptographic operations

2. **Local Storage**:
   - Encrypted data is stored in browser's localStorage
   - Clear browser data to remove stored passwords
   - Use "Clear History" feature to manually remove stored passwords

3. **Important Notes**:
   - This is a client-side application with inherent security limitations
   - For sensitive passwords, use a dedicated password manager
   - Master password cannot be recovered if lost

## 🤝 Contributing

Contributions are welcome! If you have suggestions or improvements, feel free to open an issue or submit a pull request.

## 📄 License

This project is licensed under the [MIT License](LICENSE) - see the LICENSE file for details.

## 📧 Contact

For any inquiries, questions, or feedback, please reach out to:

* Email: phemelosteve@gmail.com
* LinkedIn: [https://www.linkedin.com/in/phemelo-mokwena](https://www.linkedin.com/in/phemelo-mokwena)

Feel free to connect with me on social media or via email for more information!
