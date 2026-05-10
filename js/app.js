// Navigation smooth
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Animation au scroll
      target.style.opacity = '0';
      setTimeout(() => {
        target.style.transition = 'opacity 0.5s';
        target.style.opacity = '1';
      }, 100);
    }
  });
});

// Validation en temps réel
const form = document.getElementById('orderForm');
const inputs = form.querySelectorAll('input, select, textarea');

inputs.forEach(input => {
  input.addEventListener('blur', validateField);
  input.addEventListener('input', () => {
    if (input.classList.contains('error')) validateField.call(input);
  });
});

function validateField() {
  const field = this;
  const isValid = field.checkValidity();
  
  if (!isValid && field.value.trim() !== '') {
    field.classList.add('error');
    field.style.borderColor = '#ef4444';
  } else {
    field.classList.remove('error');
    field.style.borderColor = '';
  }
}

// Soumission du formulaire
form.addEventListener('submit', e => {
  e.preventDefault();
  
  // Validation finale
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  
  const data = {
    company: document.getElementById('company').value.trim(),
    sector: document.getElementById('sector').value || 'Non précisé',
    address: document.getElementById('address').value.trim(),
    city: document.getElementById('city').value.trim(),
    name: document.getElementById('name').value.trim(),
    role: document.getElementById('role').value.trim(),
    email: document.getElementById('email').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    plan: document.getElementById('plan').value,
    users: document.getElementById('users').value || 'Non précisé',
    startDate: document.getElementById('startDate').value || 'Flexible',
    budget: document.getElementById('budget').value || 'À définir',
    currentSystem: document.getElementById('currentSystem').value.trim() || 'Non précisé',
    requirements: document.getElementById('requirements').value.trim(),
    comments: document.getElementById('comments').value.trim() || 'Aucun'
  };

  const message = `📦 *NOUVEAU BON DE COMMANDE - ARCHIVEPME*\n` +
    `━━━━━━━━━━━━━━━━━━━━━━\n\n` +
    `🏢 *ENTREPRISE*\n` +
    `• Raison sociale: ${data.company}\n` +
    `• Secteur: ${data.sector}\n` +
    `• Adresse: ${data.address}, ${data.city}\n\n` +
    `👤 *RESPONSABLE*\n` +
    `• Nom: ${data.name}\n` +
    `• Fonction: ${data.role || 'Non précisé'}\n` +
    `• Email: ${data.email}\n` +
    `• Téléphone: ${data.phone}\n\n` +
    `⚙️ *CONFIGURATION*\n` +
    `• Offre: ${data.plan}\n` +
    `• Utilisateurs: ${data.users}\n` +
    `• Démarrage: ${data.startDate}\n` +
    `• Budget: ${data.budget} FCFA/mois\n` +
    `• Système actuel: ${data.currentSystem}\n\n` +
    `📝 *EXIGENCES SPÉCIFIQUES*\n${data.requirements}\n\n` +
    `💬 *COMMENTAIRES*\n${data.comments}\n\n` +
    `━━━━━━━━━━━━━━━━━━━━━━\n` +
    `📅 Date: ${new Date().toLocaleString('fr-FR')}`;

  const waUrl = `https://wa.me/22890588358?text=${encodeURIComponent(message)}`;
  
  // Sauvegarde locale avant envoi
  localStorage.setItem('archivepme_last_order', JSON.stringify(data));
  
  // Ouverture WhatsApp
  window.open(waUrl, '_blank');
  
  // Confirmation
  setTimeout(() => {
    alert('✅ Bon de commande envoyé avec succès !\n\nNous vous recontactons sous 24h ouvrées.\n\nUn email de confirmation vous sera envoyé.');
    form.reset();
    localStorage.removeItem('archivepme_last_order');
  }, 1000);
});

// Réinitialisation
function resetForm() {
  if (confirm('⚠️ Voulez-vous vraiment effacer toutes les données du formulaire ?')) {
    form.reset();
    localStorage.removeItem('archivepme_last_order');
    // Reset styles
    document.querySelectorAll('.error').forEach(el => {
      el.classList.remove('error');
      el.style.borderColor = '';
    });
  }
}

// Sauvegarde brouillon
function saveDraft() {
  const data = {
    company: document.getElementById('company').value,
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    savedAt: new Date().toISOString()
  };
  
  localStorage.setItem('archivepme_draft', JSON.stringify(data));
  alert('💾 Brouillon sauvegardé localement !\n\nVos données seront conservées sur cet appareil.');
}

// Restauration brouillon au chargement
window.addEventListener('load', () => {
  const draft = localStorage.getItem('archivepme_draft');
  if (draft) {
    const data = JSON.parse(draft);
    if (confirm('📋 Un brouillon a été trouvé. Voulez-vous le restaurer ?')) {
      document.getElementById('company').value = data.company || '';
      document.getElementById('name').value = data.name || '';
      document.getElementById('email').value = data.email || '';
      document.getElementById('phone').value = data.phone || '';
    }
    localStorage.removeItem('archivepme_draft');
  }
});

// Animation au scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.form-card').forEach(card => {
  card.style.opacity = '0';
  card.style.transform = 'translateY(20px)';
  card.style.transition = 'all 0.6s ease';
  observer.observe(card);
});