 // Packages data
    const packages = {
      basic: {
        name: "BASIC",
        price: 800,
        benefits: [
          "Smart Workout Plan",
          "At Home Workout"
        ]
      },
      pro: {
        name: "PRO",
        price: 900,
        benefits: [
          "Pro Workout Plan",
          "At Home Workout",
          "Personal Training"
        ]
      },
      premium: {
        name: "PREMIUM",
        price: 1200,
        benefits: [
          "Premium Workout Plan",
          "Personal Training",
          "At Home Workout",
          "Immunity Booster workouts",
          "Yoga Classes"
        ]
      }
    };

    // Elements
    const registerPhase = document.getElementById('registerPhase');
    const loginPhase = document.getElementById('loginPhase');
    const packagePhase = document.getElementById('packagePhase');
    const phaseTitle = document.getElementById('phaseTitle');

    const regName = document.getElementById('regName');
    const regEmail = document.getElementById('regEmail');
    const regPassword = document.getElementById('regPassword');

    const loginEmail = document.getElementById('loginEmail');
    const loginPassword = document.getElementById('loginPassword');

    const packageDisplay = document.getElementById('packageDisplay');

    // Buttons
    const regNextBtn = document.getElementById('regNextBtn');
    const loginBtn = document.getElementById('loginBtn');
    const backToRegister = document.getElementById('backToRegister');
    const applyBtn = document.getElementById('applyBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    // Get package from URL
    const urlParams = new URLSearchParams(window.location.search);
    const selectedPackageKey = urlParams.get('package');
    let selectedPackage = packages[selectedPackageKey];

    if (!selectedPackage) {
      // Fallback
      selectedPackage = packages.basic;
    }

    // Helper to show one phase and hide others
    function showPhase(phase) {
      registerPhase.classList.remove('active');
      loginPhase.classList.remove('active');
      packagePhase.classList.remove('active');
      phase.classList.add('active');
    }

    // Validation helpers
    function validateEmail(email) {
      return /\S+@\S+\.\S+/.test(email);
    }
    function validatePassword(pw) {
      return pw.length >= 6;
    }
    function validateName(name) {
      return name.trim().length > 0;
    }

    // Register next button handler
    regNextBtn.onclick = () => {
      const name = regName.value.trim();
      const email = regEmail.value.trim();
      const password = regPassword.value;

      if (!validateName(name)) {
        alert("Please enter your name.");
        return;
      }
      if (!validateEmail(email)) {
        alert("Please enter a valid email address.");
        return;
      }
      if (!validatePassword(password)) {
        alert("Password must be at least 6 characters long.");
        return;
      }

      // Store new user in localStorage
      let members = JSON.parse(localStorage.getItem('gym_members') || '[]');

      // Check if email already exists
      if (members.some(m => m.email.toLowerCase() === email.toLowerCase())) {
        alert("Email already registered. Please login.");
        return;
      }

      members.push({ id: members.length + 1, name, email, password, createdAt: new Date().toISOString(), role: 'member' });
      localStorage.setItem('gym_members', JSON.stringify(members));
      alert("Registration successful! Please login.");

      // Prepare login form with registered email
      loginEmail.value = email;
      loginPassword.value = "";

      // Move to login phase
      phaseTitle.textContent = "Login";
      showPhase(loginPhase);
    };

    // Back to register handler
    backToRegister.onclick = () => {
      phaseTitle.textContent = "Register";
      showPhase(registerPhase);
    };

    // Login button handler
    loginBtn.onclick = () => {
      const email = loginEmail.value.trim();
      const password = loginPassword.value;

      if (!validateEmail(email)) {
        alert("Please enter a valid email address.");
        return;
      }
      if (!validatePassword(password)) {
        alert("Password must be at least 6 characters long.");
        return;
      }

      let members = JSON.parse(localStorage.getItem('gym_members') || '[]');
      const user = members.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

      if (!user) {
        alert("Invalid login credentials. Please try again.");
        return;
      }

      // Login successful, save current user email to sessionStorage
      sessionStorage.setItem('currentUser', email);
      sessionStorage.setItem('currentRole', 'member'); // fixed to member role for join flow

      // Show package phase with details
      showPackagePhase();
    };

    // Show package info and apply button
    function showPackagePhase() {
      phaseTitle.textContent = `Apply for ${selectedPackage.name} Package`;
      registerPhase.classList.remove('active');
      loginPhase.classList.remove('active');
      packagePhase.classList.add('active');

      // Build package details html:
      packageDisplay.innerHTML = `
        <h3>${selectedPackage.name} Package</h3>
        <p><strong>Price: </strong>₹${selectedPackage.price} / Month</p>
        <strong>Benefits:</strong>
        <ul>
          ${selectedPackage.benefits.map(b => `<li>${b}</li>`).join('')}
        </ul>
      `
    }

    // Apply button handler
    applyBtn.onclick = () => {
      const email = sessionStorage.getItem('currentUser');
      if (!email) {
        alert("Please login first.");
        return;
      }

      let members = JSON.parse(localStorage.getItem('gym_members') || '[]');
      const member = members.find(m => m.email.toLowerCase() === email.toLowerCase());

      if (!member) {
        alert("User not found. Please login again.");
        return;
      }

      // Save package assignment in localStorage, e.g. in gym_packages
      let assignedPackages = JSON.parse(localStorage.getItem('gym_packages') || '[]');
      const existing = assignedPackages.find(p => p.memberId === member.id);
      if (existing) {
        alert("You have already applied for a package.");
        return;
      }
      assignedPackages.push({
        id: assignedPackages.length + 1,
        memberId: member.id,
        packageType: selectedPackage.name,
        assignedAt: new Date().toISOString()
      });
      localStorage.setItem('gym_packages', JSON.stringify(assignedPackages));

      alert(`Successfully applied to the ${selectedPackage.name} package!`);
    };

    // Logout button handler
    logoutBtn.onclick = () => {
      sessionStorage.clear();
      phaseTitle.textContent = "Register";
      regName.value = "";
      regEmail.value = "";
      regPassword.value = "";
      loginEmail.value = "";
      loginPassword.value = "";
      showPhase(registerPhase);
    };