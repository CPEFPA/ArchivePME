// Navigation smooth
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// Gestion du formulaire
const form = document.getElementById('orderForm');
form.addEventListener('submit', e => {
  e.preventDefault();
  
  const data = {
    company: document.getElementById('company').value.trim(),
    sector: document.getElementById('sector').value,
    name: document.getElementById('name').value.trim(),
    role: document.getElementById('role').value.trim(),
    email: document.getElementById('email').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    plan: document.getElementById('plan').value,
    users: document.getElementById('users').value || 'Non précisé',
    startDate: document.getElementById('startDate').value || 'Flexible',
    budget: document.getElementById('budget').value || 'À définir',
    requirements: document.getElementById('requirements').value.trim() || 'Aucune exigence particulière'
  };

  const message = `📦 *BON DE COMMANDE ARCHIVEPME*\n\n` +
    `🏢 Entreprise: ${data.company} (${data.sector})\n` +
    `👤 Responsable: ${data.name} ${data.role ? '('+data.role+')' : ''}\n` +
    `📧 Email: ${data.email}\n📱 Tél: ${data.phone}\n\n` +
    `📊 *Configuration:*\n` +
    `🔹 Offre: ${data.plan}\n` +
    `👥 Utilisateurs: ${data.users}\n` +
    `📅 Démarrage: ${data.startDate}\n` +
    `💰 Budget: ${data.budget} FCFA/mois\n\n` +
    `📝 *Exigences:*\n${data.requirements}`;

  const waUrl = `https://wa.me/22890588358?text=${encodeURIComponent(message)}`;
  window.open(waUrl, '_blank');
  
  alert('✅ Bon de commande envoyé via WhatsApp !\nNous vous recontactons sous 24h.');
  form.reset();
});

function resetForm() {
  if (confirm('Voulez-vous vraiment effacer le formulaire ?')) {
    form.reset();
  }
}