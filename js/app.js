// ArchivePME - Formulaire Mobile-First + PDF/JSON/QR
console.log("✅ ArchivePME JS loaded");

document.addEventListener('DOMContentLoaded', () => {
  console.log("✅ DOM ready");
  
  // ===== Navigation Mobile =====
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  
  navToggle?.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    navToggle.textContent = navLinks.classList.contains('active') ? '✕' : '☰';
  });
  
  // Fermer menu au clic sur un lien
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      navToggle.textContent = '☰';
    });
  });

  // ===== Formulaire =====
  const form = document.getElementById('orderForm');
  
  const getVal = (id) => document.getElementById(id)?.value?.trim() || '';
  
  const genOrderNum = () => {
    const d = new Date();
    return `AP-${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${Math.floor(1000+Math.random()*9000)}`;
  };

  const collectData = () => ({
    orderNumber: genOrderNum(),
    timestamp: new Date().toISOString(),
    company: getVal('company'), sector: getVal('sector'), address: getVal('address'), city: getVal('city'),
    name: getVal('name'), role: getVal('role'), email: getVal('email'), phone: getVal('phone'),
    plan: getVal('plan'), users: getVal('users'), startDate: getVal('startDate'), budget: getVal('budget'),
    requirements: getVal('requirements'), comments: getVal('comments')
  });

  // ===== Génération JSON =====
  const generateJSON = (data) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `ArchivePME_${data.orderNumber}.json`;
    a.click(); URL.revokeObjectURL(url);
    console.log("✅ JSON downloaded");
  };

  // ===== Génération PDF + QR =====
  const generatePDF = async (data) => {
    try {
      // QR Code
      const waMsg = `Commande ${data.orderNumber} - ${data.company}`;
      const qrUrl = await QRCode.toDataURL(`https://wa.me/22890588358?text=${encodeURIComponent(waMsg)}`, { width: 100 });
      
      // PDF
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      
      // Header
      doc.setFillColor(37, 99, 235); doc.rect(0, 0, 210, 30, 'F');
      doc.setTextColor(255); doc.setFontSize(16); doc.text("ARCHIVEPME - BON DE COMMANDE", 15, 18);
      doc.setFontSize(10); doc.text(`N° ${data.orderNumber}`, 145, 18);
      
      // QR
      if (qrUrl) doc.addImage(qrUrl, 'PNG', 160, 5, 40, 40);
      
      // Content
      doc.setTextColor(0); doc.setFontSize(11);
      let y = 45;
      const fields = [
        ["Entreprise", data.company], ["Email", data.email], ["Téléphone", data.phone],
        ["Formule", data.plan], ["Utilisateurs", data.users], ["Budget", data.budget + " FCFA"]
      ];
      fields.forEach(([k,v]) => {
        doc.setFont("helvetica", "bold"); doc.text(`${k}:`, 15, y);
        doc.setFont("helvetica", "normal"); doc.text(`${v || '-'}`, 70, y); y += 7;
      });
      y += 5;
      doc.setFont("helvetica", "bold"); doc.text("Exigences:", 15, y); y += 7;
      doc.setFont("helvetica", "normal");
      const split = doc.splitTextToSize(data.requirements || '-', 180);
      doc.text(split, 15, y);
      
      // Footer
      doc.setFontSize(8); doc.setTextColor(120);
      doc.text("RHEMA CORPORATION OFFICE | +228 90 58 83 58", 15, 285);
      
      doc.save(`ArchivePME_${data.orderNumber}.pdf`);
      console.log("✅ PDF downloaded");
    } catch (err) { console.error("PDF error:", err); }
  };

  // ===== Soumission Formulaire =====
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log("📤 Form submitted");
    
    if (!form.checkValidity()) { form.reportValidity(); return; }
    
    const data = collectData();
    console.log("📦 Order data:", data);
    
    // Message WhatsApp
    const waMsg = `📦 *COMMANDE ARCHIVEPME*\n🆔 ${data.orderNumber}\n\n🏢 ${data.company}\n👤 ${data.name}\n📧 ${data.email}\n📱 ${data.phone}\n📦 ${data.plan}\n👥 ${data.users} users\n💰 ${data.budget} FCFA\n\n📝 ${data.requirements}`;
    const waUrl = `https://wa.me/22890588358?text=${encodeURIComponent(waMsg)}`;
    
    try {
      // Générer fichiers
      generateJSON(data);
      if (window.jspdf && window.QRCode) await generatePDF(data);
      
      // Ouvrir WhatsApp
      window.open(waUrl, '_blank');
      
      // Confirmation mobile-friendly
      if ('vibrate' in navigator) navigator.vibrate(200);
      alert(`✅ Commande ${data.orderNumber} envoyée !\n\n📥 Fichiers téléchargés\n💬 WhatsApp ouvert`);
      
      // Reset
      form.reset();
      localStorage.removeItem('archivepme_draft');
      
    } catch (err) {
      console.error("Submit error:", err);
      alert("⚠️ WhatsApp s'ouvre. Les fichiers peuvent être téléchargés manuellement via les boutons JSON/PDF.");
      window.open(waUrl, '_blank');
    }
  });

  // ===== Boutons JSON/PDF =====
  document.getElementById('btnJson')?.addEventListener('click', () => {
    if (!getVal('company') || !getVal('email')) { alert("Remplissez au moins Entreprise et Email"); return; }
    const data = collectData();
    generateJSON(data);
    alert("✅ JSON téléchargé !");
  });

  document.getElementById('btnPdf')?.addEventListener('click', async () => {
    if (!getVal('company') || !getVal('email')) { alert("Remplissez au moins Entreprise et Email"); return; }
    if (!window.jspdf) { alert("📦 Chargement des outils PDF... Veuillez réessayer dans 3 secondes."); return; }
    const data = collectData();
    await generatePDF(data);
    alert("✅ PDF téléchargé !");
  });

  // ===== Reset =====
  window.resetForm = () => {
    if (confirm("Effacer le formulaire ?")) { form?.reset(); }
  };

  // ===== PWA Install =====
  let deferredPrompt;
  const installBtn = document.getElementById('installBtn');
  
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); deferredPrompt = e; installBtn.style.display = 'flex';
  });
  
  installBtn?.addEventListener('click', async () => {
    if (deferredPrompt) { deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt = null; installBtn.style.display = 'none'; }
  });

  // ===== Service Worker =====
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(console.log);
  }

  console.log("🚀 ArchivePME initialized");
});