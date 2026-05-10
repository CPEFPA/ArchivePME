// ==========================================
// ARCHIVEPME - Gestion Formulaire + PDF/JSON/QR
// ==========================================

// Navigation smooth
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    document.querySelector(link.getAttribute('href'))?.scrollIntoView({ behavior: 'smooth' });
  });
});

// Collecte des données du formulaire
function getFormData() {
  return {
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
}

// Génération numéro de commande
function generateOrderNumber() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,'0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `AP-${y}${m}${rand}`;
}

// ==========================================
// 📥 GÉNÉRATION JSON
// ==========================================
function generateJSON() {
  const data = getFormData();
  if (!data.company || !data.email) {
    alert("⚠️ Veuillez au moins remplir le nom de l'entreprise et l'email.");
    return;
  }
  
  const orderNum = generateOrderNumber();
  const jsonData = {
    orderNumber: orderNum,
    generatedAt: new Date().toISOString(),
    client: { company: data.company, sector: data.sector, location: `${data.address}, ${data.city}`, contact: { name: data.name, role: data.role, email: data.email, phone: data.phone } },
    config: { plan: data.plan, users: data.users, budget: data.budget, startDate: data.startDate, currentSystem: data.currentSystem },
    requirements: data.requirements,
    comments: data.comments
  };
  
  const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ArchivePME_Commande_${orderNum}.json`;
  a.click();
  URL.revokeObjectURL(url);
  localStorage.setItem('archivepme_last_order', JSON.stringify({ ...data, orderNum }));
}

// ==========================================
// 📄 GÉNÉRATION PDF + QR CODE
// ==========================================
async function generatePDF() {
  const btn = document.getElementById('btnPdf');
  const data = getFormData();
  if (!data.company || !data.email) { alert("⚠️ Remplissez au moins l'entreprise et l'email."); return; }
  
  btn.classList.add('loading');
  const orderNum = generateOrderNumber();
  const waMsg = `Commande ${orderNum}: ${data.company} - ${data.plan}`;
  const waUrl = `https://wa.me/22890588358?text=${encodeURIComponent(waMsg)}`;
  
  try {
    // Génération QR Code
    const qrDataUrl = await QRCode.toDataURL(waUrl, { width: 120, margin: 1 });
    
    // Création PDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // En-tête
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, 210, 35, 'F');
    doc.setTextColor(255,255,255);
    doc.setFontSize(20);
    doc.text("ARCHIVEPME - BON DE COMMANDE", 20, 22);
    doc.setFontSize(11);
    doc.text(`N° ${orderNum}`, 140, 22);
    
    // QR Code
    if (qrDataUrl) doc.addImage(qrDataUrl, 'PNG', 155, 5, 45, 45);
    
    // Corps
    doc.setTextColor(0,0,0);
    doc.setFontSize(13);
    doc.text("Informations Client", 20, 55);
    doc.setDrawColor(200);
    doc.line(20, 58, 190, 58);
    
    const fields = [
      ["Entreprise", data.company], ["Secteur", data.sector],
      ["Adresse", `${data.address}, ${data.city}`], ["Responsable", data.name],
      ["Fonction", data.role], ["Email", data.email], ["Téléphone", data.phone],
      ["Formule", data.plan], ["Utilisateurs", data.users],
      ["Budget", `${data.budget} FCFA/mois`], ["Démarrage", data.startDate]
    ];
    
    let y = 68;
    doc.setFontSize(11);
    fields.forEach(([label, value]) => {
      doc.setFont("helvetica", "bold"); doc.text(`${label}:`, 20, y);
      doc.setFont("helvetica", "normal"); doc.text(`${value || '-'}`, 75, y);
      y += 7;
    });
    
    y += 5;
    doc.setFont("helvetica", "bold"); doc.text("Exigences & Besoins:", 20, y); y += 8;
    doc.setFont("helvetica", "normal");
    const splitText = doc.splitTextToSize(data.requirements || 'Aucune exigence particulière', 170);
    doc.text(splitText, 20, y);
    
    // Pied de page
    doc.setFontSize(9); doc.setTextColor(120);
    doc.text("Document généré automatiquement | contact@archivepme.com | +228 90 58 83 58", 20, 285);
    
    doc.save(`ArchivePME_Commande_${orderNum}.pdf`);
    localStorage.setItem('archivepme_last_order', JSON.stringify({ ...data, orderNum }));
    alert("✅ PDF généré et téléchargé avec succès !");
  } catch (err) {
    console.error(err);
    alert("❌ Erreur lors de la génération du PDF.");
  } finally {
    btn.classList.remove('loading');
  }
}

// ==========================================
// 📤 SOUMISSION FORMULAIRE
// ==========================================
document.getElementById('orderForm').addEventListener('submit', async e => {
  e.preventDefault();
  const data = getFormData();
  if (!form.checkValidity()) { form.reportValidity(); return; }
  
  const orderNum = generateOrderNumber();
  const waMsg = `📦 *BON DE COMMANDE ARCHIVEPME*\nN°: ${orderNum}\n\n🏢 ${data.company} (${data.sector})\n👤 ${data.name} ${data.role ? '('+data.role+')' : ''}\n📧 ${data.email} | 📱 ${data.phone}\n\n⚙️ Offre: ${data.plan} | 👥 ${data.users} | 💰 ${data.budget} FCFA\n📅 Démarrage: ${data.startDate}\n\n📝 *Exigences:*\n${data.requirements}\n\n💬 *Commentaires:*\n${data.comments}`;
  
  // Génération auto des fichiers
  try {
    const qrUrl = await QRCode.toDataURL(`https://wa.me/22890588358?text=${encodeURIComponent(`Commande ${orderNum} - ${data.company}`)}`, { width: 120 });
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFillColor(37,99,235); doc.rect(0,0,210,35,'F');
    doc.setTextColor(255); doc.setFontSize(18); doc.text(`ARCHIVEPME - ${orderNum}`, 20, 22);
    doc.addImage(qrUrl, 'PNG', 155, 5, 45, 45);
    doc.setTextColor(0); doc.setFontSize(12);
    let y=55;
    Object.entries(data).forEach(([k,v]) => { doc.setFont("helvetica","bold"); doc.text(`${k}:`,20,y); doc.setFont("helvetica","normal"); doc.text(`${v||'-'}`,80,y); y+=7; });
    doc.save(`ArchivePME_${orderNum}.pdf`);
    
    const jsonBlob = new Blob([JSON.stringify({ orderNum, ...data }, null, 2)], { type: 'application/json' });
    const jsonUrl = URL.createObjectURL(jsonBlob);
    const a = document.createElement('a'); a.href=jsonUrl; a.download=`${orderNum}.json`; a.click();
  } catch(err) { console.warn("Génération auto échouée, envoi WhatsApp maintenu", err); }
  
  window.open(`https://wa.me/22890588358?text=${encodeURIComponent(waMsg)}`, '_blank');
  alert("✅ Bon de commande envoyé !\n📥 Les fichiers PDF/JSON ont été téléchargés.");
  form.reset();
});

function resetForm() { if(confirm("Effacer le formulaire ?")) form.reset(); }

// Animation au scroll
const obs = new IntersectionObserver(entries => entries.forEach(e => e.isIntersecting && (e.target.style.opacity='1', e.target.style.transform='translateY(0)')), {threshold:0.1});
document.querySelectorAll('.form-card').forEach(c => { c.style.opacity='0'; c.style.transform='translateY(20px)'; c.style.transition='all 0.6s ease'; obs.observe(c); });