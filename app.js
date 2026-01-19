
        let docBlobs = {
            id_card: null,
            cv: null,
            diploma: null,
            attestation: null,
            leave_justif: null
        };



        // --- CONFIGURATION ---
        const BASE_API = "https://mon-api-rh.onrender.com/api"; 

        const URL_LOGIN = `${BASE_API}/login`; 
        const URL_READ = `${BASE_API}/read`; 
        const URL_WRITE_POST = `${BASE_API}/write`; 
        const URL_UPDATE = `${BASE_API}/update`; 
        const URL_LOG = `${BASE_API}/log`; 
        const URL_READ_LOGS = `${BASE_API}/read-logs`; 
        const URL_GATEKEEPER = `${BASE_API}/gatekeeper`; 
        const URL_BADGE_GEN = `${BASE_API}/badge`; 
        const URL_EMPLOYEE_UPDATE = `${BASE_API}/emp-update`; 
        const URL_CONTRACT_GENERATE = `${BASE_API}/contract-gen`;
        const URL_UPLOAD_SIGNED_CONTRACT = `${BASE_API}/contract-upload`;
        const URL_LEAVE_REQUEST = `${BASE_API}/leave`;  
        const URL_CLOCK_ACTION = `${BASE_API}/clock`;
        const URL_READ_LEAVES = `${BASE_API}/read-leaves`;
        const URL_LEAVE_ACTION = `${BASE_API}/leave-action`;
        // --- AJOUTER ICI ---
        const URL_READ_CANDIDATES = `${BASE_API}/read-candidates`; 
        const URL_CANDIDATE_ACTION = `${BASE_API}/candidate-action`;

        const SCAN_KEY = "SIGD_SECURE_2025"; 
        const URL_REDIRECT_FAILURE = "https://google.com";

        let currentUser = null, employees = [], videoStream = null, capturedBlob = null, contractBlob = null, contractStream = null;
 
        let currentPage = 1;
        const ITEMS_PER_PAGE = 10; // Nombre d'employés par page







 // --- AUTO-RECONNEXION AVEC LOADER ---
        window.addEventListener('DOMContentLoaded', () => {
            const session = localStorage.getItem('sirh_user_session');
            const loader = document.getElementById('initial-loader');

            if(session) {
                try {
                    const u = JSON.parse(session);
                    if(u && u.nom) {
                        console.log("Restauration session : " + u.nom);
                        // On connecte l'utilisateur
                        setSession(u.nom, u.role, u.id);
                        
                                        // Dans window.addEventListener('DOMContentLoaded', ...)
        
        // ... (après setSession) ...
                            
                            // On laisse le loader 1 seconde (1000ms) pour faire "Pro"
                            setTimeout(() => {
                                const loader = document.getElementById('initial-loader');
                                loader.style.opacity = '0';
                                loader.style.transform = 'scale(1.1)'; // Petit effet de zoom en disparaissant
                                setTimeout(() => loader.classList.add('hidden'), 700);
                            }, 1200);

                        
                    } else {
                        throw new Error("Session invalide");
                    }
                } catch(e) { 
                    // Si erreur de lecture, on nettoie et on montre le login
                    localStorage.removeItem('sirh_user_session');
                    loader.classList.add('hidden');
                }
            } else {
                // Pas de session, on montre immédiatement le login
                loader.classList.add('hidden');
            }
        });









        document.getElementById('current-date').innerText = new Date().toLocaleDateString('fr-FR');


                let chartStatusInstance = null;
                let chartDeptInstance = null;

        // Fonction mathématique pour calculer la distance entre deux points GPS
        function getDistance(lat1, lon1, lat2, lon2) {
            const R = 6371e3; // Rayon de la terre en mètres
            const φ1 = lat1 * Math.PI/180;
            const φ2 = lat2 * Math.PI/180;
            const Δφ = (lat2-lat1) * Math.PI/180;
            const Δλ = (lon2-lon1) * Math.PI/180;
            const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                      Math.cos(φ1) * Math.cos(φ2) *
                      Math.sin(Δλ/2) * Math.sin(Δλ/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            return R * c; // Résultat en mètres
        }


        


        async function downloadMyBadge() {
            // 1. On cherche les infos de l'employé connecté
            // (On utilise find car 'employees' contient la liste chargée au login)
            const myData = employees.find(e => e.nom.toLowerCase().includes(currentUser.nom.toLowerCase()));
            
            if(!myData) {
                return Swal.fire('Erreur', 'Impossible de charger les données de votre badge. Réessayez dans un instant.', 'error');
            }

            const token = localStorage.getItem('sirh_token');
            
            Swal.fire({ title: 'Génération...', didOpen: () => Swal.showLoading() });

            try {
                // 2. Construction de l'URL
                const url = `${URL_BADGE_GEN}?id=${encodeURIComponent(myData.id)}&nom=${encodeURIComponent(myData.nom)}&poste=${encodeURIComponent(myData.poste)}&photo=${encodeURIComponent(myData.photo||'')}&agent=${encodeURIComponent(currentUser.nom)}&token=${token}`;

                // 3. Récupération du HTML (au lieu d'ouvrir l'URL direct)
                const response = await fetch(url);
                
                if (!response.ok) throw new Error("Erreur lors de la génération du badge");

                const htmlContent = await response.text();

                // 4. Affichage dans une nouvelle fenêtre
                Swal.close();
                const w = window.open('', '_blank', 'width=400,height=600');
                
                if (w) {
                    w.document.open();
                    w.document.write(htmlContent);
                    w.document.close();
                } else {
                    Swal.fire('Bloqué', 'Veuillez autoriser les pop-ups pour voir votre badge', 'warning');
                }

            } catch (error) {
                console.error(error);
                Swal.fire('Erreur', 'Impossible de générer le badge.', 'error');
            }
        }



async function secureFetch(url, options = {}) {
    const token = localStorage.getItem('sirh_token');
    const headers = options.headers || {};
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // 1. CONFIGURATION DU TIMEOUT (25 secondes)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 25000ms = 25s

    try {
        // 2. APPEL RÉSEAU
        const response = await fetch(url, { 
            ...options, 
            headers, 
            signal: controller.signal // On lie le contrôleur d'annulation
        });

        clearTimeout(timeoutId); // On annule le timer si la réponse arrive

        // 3. GESTION FINE DES ERREURS HTTP
        if (!response.ok) {
            // On essaie de lire le message d'erreur du serveur (JSON), sinon texte générique
            let errorMessage = `Erreur serveur (${response.status})`;
            try {
                const errData = await response.json();
                if (errData.error) errorMessage = errData.error;
            } catch (e) { /* Pas de JSON, on garde le message par défaut */ }

            if (response.status === 401 || response.status === 403) {
                throw new Error("Accès refusé ou session expirée.");
            }
            throw new Error(errorMessage);
        }

        return response;

    } catch (error) {
        // 4. GESTION DU TIMEOUT ET ERREURS RÉSEAU
        if (error.name === 'AbortError') {
            throw new Error("Le serveur met trop de temps à répondre (Timeout). Vérifiez votre connexion.");
        }
        if (error.message.includes('Failed to fetch')) {
            throw new Error("Impossible de contacter le serveur. Vérifiez votre internet.");
        }
        throw error; // On renvoie l'erreur pour qu'elle soit affichée par l'appelant
    }
}





















async function handleLogin(e) { 
            e.preventDefault(); 
            
            // On tente quand même, même si le navigateur dit hors ligne (parfois il se trompe)
            // if(!navigator.onLine) ... <-- SUPPRIMÉ
            
            const u = document.getElementById('login-user').value.trim();
            const p = document.getElementById('login-pass').value.trim();
            const btn = document.getElementById('btn-login');
            const originalBtnText = btn.innerHTML; 
            
            btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Connexion...'; 
            btn.disabled = true;
            btn.classList.add('opacity-50', 'cursor-not-allowed');
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000); 

            try {
                const response = await fetch(`${URL_LOGIN}?u=${encodeURIComponent(u.toLowerCase())}&p=${encodeURIComponent(p)}`, { signal: controller.signal });
                clearTimeout(timeoutId); 
                
                const d = await response.json();
                
                if(d.status === "success") { 
                    if(d.token) localStorage.setItem('sirh_token', d.token);
                    let r = d.role || "EMPLOYEE"; if(Array.isArray(r)) r = r[0]; 
                    
                    const userData = { nom: d.nom || u, role: String(r).toUpperCase(), id: d.id };
                    localStorage.setItem('sirh_user_session', JSON.stringify(userData));

                    const Toast = Swal.mixin({toast: true, position: 'top-end', showConfirmButton: false, timer: 2000});
                    Toast.fire({icon: 'success', title: 'Bienvenue ' + userData.nom});
                    
                    setSession(userData.nom, userData.role, userData.id); 
                } else { 
                    Swal.fire('Refusé', 'Identifiant ou mot de passe incorrect', 'error'); 
                }
            } catch (error) {
                // C'est ICI qu'on gère vraiment l'erreur de connexion
                console.error(error);
                if (error.name === 'AbortError') { 
                    Swal.fire('Délai dépassé', 'Le serveur met du temps à répondre. Vérifiez votre connexion.', 'warning'); 
                } else if (!navigator.onLine) {
                    Swal.fire('Hors Ligne', 'Vous semblez déconnecté d\'internet.', 'error');
                } else { 
                    Swal.fire('Erreur Système', 'Impossible de contacter le serveur. Réessayez.', 'error'); 
                }
            } finally {
                btn.innerHTML = originalBtnText; btn.disabled = false; btn.classList.remove('opacity-50', 'cursor-not-allowed');
            }
        }
























        function setSession(n, r, id){ 
            currentUser = { nom: n, role: r, id: id }; 
            document.getElementById('login-screen').classList.add('hidden'); 
            document.getElementById('app-layout').classList.remove('hidden'); 
            document.getElementById('name-display').innerText = n; 
            document.getElementById('role-display').innerText = r; 
            document.getElementById('avatar-display').innerText = n[0]; 
            document.body.className = "text-slate-900 overflow-hidden h-screen w-screen role-" + r.toLowerCase(); 
            
            if(r === 'EMPLOYEE') { switchView('my-profile'); } else { switchView('dash'); }

            // AFFICHAGE DES SKELETONS
            const skeletonRow = `<tr class="border-b"><td class="p-4 flex gap-3 items-center"><div class="w-10 h-10 rounded-full skeleton"></div><div class="space-y-2"><div class="h-3 w-24 rounded skeleton"></div><div class="h-2 w-16 rounded skeleton"></div></div></td><td class="p-4"><div class="h-3 w-32 rounded skeleton"></div></td><td class="p-4"><div class="h-6 w-16 rounded-lg skeleton"></div></td><td class="p-4"></td></tr>`;
            document.getElementById('full-body').innerHTML = Array(6).fill(skeletonRow).join('');
            
            fetchData(false);
        }




                async function refreshAllData() {
    const icon = document.getElementById('refresh-icon'); 
    
    // Animation visuelle
    if(icon) icon.classList.add('fa-spin');
    
    // On vide les tableaux pour montrer que ça charge (Skeletons)
    const skeletonRow = `<tr class="border-b"><td class="p-4 flex gap-3 items-center"><div class="w-10 h-10 rounded-full skeleton"></div><div class="space-y-2"><div class="h-3 w-24 rounded skeleton"></div><div class="h-2 w-16 rounded skeleton"></div></div></td><td class="p-4"><div class="h-3 w-32 rounded skeleton"></div></td><td class="p-4"><div class="h-6 w-16 rounded-lg skeleton"></div></td><td class="p-4"></td></tr>`;
    document.getElementById('full-body').innerHTML = Array(6).fill(skeletonRow).join('');
    
    // Petit Toast de chargement en haut à droite
    const Toast = Swal.mixin({toast: true, position: 'top-end', showConfirmButton: false});
    Toast.fire({icon: 'info', title: 'Actualisation générale...'});

    try {
        // LANCE TOUTES LES MISES À JOUR EN MÊME TEMPS (Parallèle)
        // fetchData(true) -> Force la mise à jour des employés/dossiers/profils
        // fetchLeaveRequests() -> Met à jour les congés
        
        // Dans refreshAllData()
        await Promise.all([
            fetchData(true), 
            fetchLeaveRequests(),
            fetchCandidates() // <--- AJOUTE CELA
        ]);

        // Si tout s'est bien passé
        Toast.fire({icon: 'success', title: 'Tout est à jour !', timer: 2000});

    } catch (error) {
        // Si UNE SEULE requête échoue, on affiche l'erreur
        console.error(error);
        Swal.fire({
            icon: 'error',
            title: 'Échec de l\'actualisation',
            text: error.message,
            confirmButtonColor: '#0f172a'
        });
        
        // On remet les données en cache si possible pour ne pas laisser l'écran vide
        fetchData(false); 
    } finally {
        // On arrête l'animation quoi qu'il arrive
        if(icon) setTimeout(() => icon.classList.remove('fa-spin'), 500);
    }
}






        async function fetchData(forceUpdate = false){ 
            const CACHE_KEY = 'sirh_data_v1';
            const CACHE_TIME = 1000 * 60 * 60; 
            if (!forceUpdate) {
                const cached = localStorage.getItem(CACHE_KEY);
                const cachedTime = localStorage.getItem(CACHE_KEY + '_time');
                if (cached && cachedTime && (Date.now() - cachedTime < CACHE_TIME)) {
                    employees = JSON.parse(cached);
                    renderData();
                    loadMyProfile();
                    renderCharts();
                    fetchLeaveRequests(); // <--- AJOUTÉ : Pour charger les congés depuis le cache
                    return; 
                }
            }
            try{ 
                let fetchUrl = `${URL_READ}?agent=${encodeURIComponent(currentUser.nom)}`;
                const r = await secureFetch(fetchUrl); 
                const d = await r.json(); 
                console.log("Données reçues de Make :", d[0]); // Affiche le premier employé reçu

// Dans la fonction fetchData...

employees = d.map(x => {
    // Sécurité pour la photo : on regarde si c'est 'photo' ou 'Photo' ou 'Photos'
    let rawPhoto = x.photo || x.Photo || x.Photos;

    return { 
        id: x.employee_id || x.id, 
        nom: x.nom || x.Nom, 
        date: x.date_embauche || x.date, 
        poste: x.poste || x.Poste, 
        dept: x['département'] || x.departement || "Non défini", 
        limit: x.type_contrat || 365, 
        
        // ICI : On passe la donnée brute, la fonction formatGoogleLink s'occupera du reste
        photo: rawPhoto, 
        
        statut: x.Statut || 'Actif', 
        email: x.email, 
        telephone: x.telephone || x['téléphone'], 
        adresse: x.adresse, 
        date_naissance: x.date_naissance, 
        role: x.role || x.Role || 'EMPLOYEE',

        
        // Gestion des documents
        doc: x.contrat_pdf ? formatGoogleLink(x.contrat_pdf) : '#',
        contract_status: x.contract_status || 'Non signé',
        cv_link: formatGoogleLink(x.cv_link) || '#',
        id_card_link: formatGoogleLink(x.id_card_link) || '#',
        diploma_link: formatGoogleLink(x.diploma_link) || '#',
        attestation_link: formatGoogleLink(x.attestation) || '#',
        lm_link: formatGoogleLink(x.lm_link) || '#'

        
    };
});



                localStorage.setItem(CACHE_KEY, JSON.stringify(employees));
                localStorage.setItem(CACHE_KEY + '_time', Date.now());
                renderData(); 
                loadMyProfile();
                renderCharts();
                fetchLeaveRequests(); // <--- AJOUTÉ : Pour charger les congés en direct
            } catch(e){ 
                console.error(e); 
                const cached = localStorage.getItem(CACHE_KEY);
                if(cached) {
                    employees = JSON.parse(cached);
                    renderData(); loadMyProfile(); renderCharts(); fetchLeaveRequests();
                } else { Swal.fire('Erreur', 'Impossible de récupérer les données', 'error'); }
            } 
        }










        







         















                                                                                function renderData() { 
            const b = document.getElementById('full-body'); 
            const d = document.getElementById('dashboard-body'); 
            b.innerHTML = ''; 
            d.innerHTML = ''; 
            
            let total = 0, alertes = 0, actifs = 0; 

            // 1. CALCUL DES STATISTIQUES (Sur tout l'effectif)
            employees.forEach(e => { 
                total++; 
                const rawStatus = (e.statut || 'Actif').toLowerCase().trim();
                const isA = rawStatus === 'actif'; 
                if(isA) actifs++; 
                
                let dL = 999, isU = false;
                if(e.date) {
                    let sD = parseDateSmart(e.date); 
                    let eD = new Date(sD); 
                    eD.setDate(eD.getDate() + (parseInt(e.limit) || 365));
                    dL = Math.ceil((eD - new Date()) / 86400000); 
                    if(isA) { 
                        if(dL < 0) { alertes++; } 
                        else if(dL <= 15) { isU = true; alertes++; } 
                    }
                }

                // Affichage Dashboard (Alertes) - SÉCURISÉ
                if(isU || (dL < 0 && isA)) {
                    d.innerHTML += `<tr class="bg-white border-b"><td class="p-4 text-sm font-bold text-slate-700">${escapeHTML(e.nom)}</td><td class="p-4 text-xs text-slate-500">${escapeHTML(e.poste)}</td><td class="p-4 ${dL<0?'text-red-600':'text-orange-600'} font-bold text-xs uppercase">${dL<0?'Expiré':dL+' jours'}</td><td class="p-4 rh-only text-right"><button class="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold" onclick="openEditModal('${escapeHTML(e.id)}')">GÉRER</button></td></tr>`; 
                }
            }); 

            // 2. PAGINATION ET AFFICHAGE TABLEAU PRINCIPAL
            const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
            const endIndex = startIndex + ITEMS_PER_PAGE;
            const paginatedEmployees = employees.slice(startIndex, endIndex);

            paginatedEmployees.forEach(e => {
                const rawStatus = (e.statut || 'Actif').toLowerCase().trim();
                let dL = 999, isU = false, isExpired = false;
                
                if(e.date) {
                    let sD = parseDateSmart(e.date); 
                    let eD = new Date(sD); 
                    eD.setDate(eD.getDate() + (parseInt(e.limit) || 365));
                    dL = Math.ceil((eD - new Date()) / 86400000); 
                    if(rawStatus === 'actif') {
                        if(dL < 0) isExpired = true;
                        else if(dL <= 15) isU = true;
                    }
                }

                const isConges = rawStatus.includes('cong');
                const isSortie = rawStatus.includes('sortie');

                let bdgClass = "bg-green-100 text-green-700";
                let bdgLabel = e.statut || 'Actif';

                if(isConges) { bdgClass = "bg-blue-100 text-blue-700"; bdgLabel = "CONGÉ"; }
                if(isSortie) { bdgClass = "bg-slate-100 text-slate-500"; bdgLabel = "SORTIE"; }
                if(isU) { bdgClass = "bg-orange-100 text-orange-700 animate-pulse font-bold"; bdgLabel = `FIN: ${dL}j`; }
                if(isExpired) { bdgClass = "bg-red-100 text-red-700 font-bold border border-red-200"; bdgLabel = `EXPIRÉ`; }

                const av = e.photo && e.photo.length > 10 ? `<img src="${formatGoogleLink(e.photo)}" loading="lazy" decoding="async" class="w-10 h-10 rounded-full object-cover bg-slate-200 border border-slate-200">` : `<div class="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200 rounded-full flex items-center justify-center text-xs font-black text-slate-500">${escapeHTML(e.nom).substring(0,2).toUpperCase()}</div>`;
                
                const sStr = String(e.contract_status || '').toLowerCase().trim(); 
                const isSigned = (sStr === 'signé' || sStr === 'signe');
                
                // IDs sécurisés pour les fonctions JS
                const safeId = escapeHTML(e.id);

                const contractActions = `
                <div class="flex items-center justify-end gap-2">
                    <button onclick="openFullFolder('${safeId}')" title="Dossier Complet" class="p-2 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-500 hover:text-white transition-all"><i class="fa-solid fa-folder-open"></i></button>
                    <div class="h-4 w-[1px] bg-slate-200 mx-1"></div>
                    ${!isSigned ? `<button onclick="generateDraftContract('${safeId}')" class="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all"><i class="fa-solid fa-file-contract"></i></button>` : `<span class="text-[10px] font-black text-emerald-500 uppercase bg-emerald-50 px-2 py-1 rounded">Signé</span>`}
                    <button onclick="openContractModal('${safeId}')" class="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-800 hover:text-white transition-all"><i class="fa-solid fa-upload"></i></button>
                    <div class="h-4 w-[1px] bg-slate-200 mx-1"></div>
                    <button onclick="printBadge('${safeId}')" class="text-slate-400 hover:text-blue-600 transition-all"><i class="fa-solid fa-print"></i></button>
                    <button onclick="openEditModal('${safeId}')" class="text-slate-400 hover:text-slate-800 transition-all"><i class="fa-solid fa-pen"></i></button>
                </div>`;
                
                // SÉCURISATION HTML (TOUTES LES VARIABLES)
                b.innerHTML+=`<tr class="border-b hover:bg-slate-50 transition-colors"><td class="p-4 flex gap-3 items-center min-w-[200px]">${av}<div><div class="font-bold text-sm text-slate-800 uppercase">${escapeHTML(e.nom)}</div><div class="text-[10px] text-slate-400 font-mono tracking-tighter">${safeId}</div></div></td><td class="p-4 text-xs font-medium text-slate-500">${escapeHTML(e.poste)}</td><td class="p-4"><span class="px-3 py-1 border rounded-lg text-[10px] font-black uppercase ${bdgClass}">${escapeHTML(bdgLabel)}</span></td><td class="p-4 rh-only">${contractActions}</td></tr>`; 
            });

            // 3. Mise à jour des compteurs
            document.getElementById('stat-total').innerText = total; 
            document.getElementById('stat-alert').innerText = alertes; 
            document.getElementById('stat-active').innerText = actifs;

            // 4. Pagination UI
            const totalPages = Math.ceil(employees.length / ITEMS_PER_PAGE);
            document.querySelectorAll('.page-info-global').forEach(el => { el.innerText = `PAGE ${currentPage} / ${totalPages || 1}`; });
            document.querySelectorAll('.btn-prev-global').forEach(btn => { btn.disabled = currentPage === 1; btn.classList.toggle('opacity-30', currentPage === 1); });
            document.querySelectorAll('.btn-next-global').forEach(btn => { btn.disabled = currentPage >= totalPages; btn.classList.toggle('opacity-30', currentPage >= totalPages); });
        }




























        function openLeaveModal() {
            document.getElementById('leave-modal').classList.remove('hidden');
            document.getElementById('leave-start').valueAsDate = new Date();
            document.getElementById('leave-end').valueAsDate = new Date();
        }







                async function submitLeaveRequest(e) {
            e.preventDefault();
            
            const fd = new FormData();
            fd.append('employee_id', currentUser.id);
            fd.append('nom', currentUser.nom);
            fd.append('type', document.querySelector('input[name="leave_type"]:checked').value);
            fd.append('date_debut', document.getElementById('leave-start').value);
            fd.append('date_fin', document.getElementById('leave-end').value);
            fd.append('motif', document.getElementById('leave-reason').value);
            fd.append('date_demande', new Date().toISOString());
            fd.append('agent', currentUser.nom);

            // Ajout du justificatif s'il a été pris en photo ou uploadé
            if (docBlobs.leave_justif) {
                fd.append('justificatif', docBlobs.leave_justif, 'justificatif_conge.jpg');
            }

            Swal.fire({ title: 'Envoi...', text: 'Traitement de votre demande', didOpen: () => Swal.showLoading(), allowOutsideClick: false });

            try {
                const response = await secureFetch(URL_LEAVE_REQUEST, { method: 'POST', body: fd });
                if (response.ok) {
                    document.getElementById('leave-modal').classList.add('hidden');
                    e.target.reset();
                    docBlobs.leave_justif = null;
                    document.getElementById('leave-doc-preview').innerHTML = '<i class="fa-solid fa-camera"></i>';
                    Swal.fire('Succès', 'Votre demande de congé a été envoyée.', 'success');
                }
            } catch (error) { 
                Swal.fire('Erreur', "Échec de l'envoi : " + error.message, 'error'); 
            }
        }








        function updateClockUI(isIn) {
            const btn = document.getElementById('btn-clock');
            const dot = document.getElementById('clock-status-dot');
            const text = document.getElementById('clock-status-text');
            if(!btn) return; 
            if (isIn) {
                btn.classList.remove('bg-emerald-500', 'hover:bg-emerald-400');
                btn.classList.add('bg-red-500', 'hover:bg-red-400');
                btn.innerHTML = '<i class="fa-solid fa-person-walking-arrow-right"></i> <span>SORTIE</span>';
                dot.classList.remove('bg-red-500'); dot.classList.add('bg-emerald-500', 'shadow-emerald-500/50');
                text.innerText = "EN POSTE"; text.classList.add('text-emerald-500'); text.classList.remove('text-slate-800');
            } else {
                btn.classList.remove('bg-red-500', 'hover:bg-red-400');
                btn.classList.add('bg-emerald-500', 'hover:bg-emerald-400');
                btn.innerHTML = '<i class="fa-solid fa-fingerprint"></i> <span>ENTRÉE</span>';
                dot.classList.remove('bg-emerald-500'); dot.classList.add('bg-red-500', 'shadow-red-500/50');
                text.innerText = "NON POINTÉ"; text.classList.remove('text-emerald-500'); text.classList.add('text-slate-800');
            }
        }

        async function handleClockInOut() {
            const currentStatus = localStorage.getItem('clock_status_' + currentUser.id);
            const action = currentStatus === 'IN' ? 'CLOCK_OUT' : 'CLOCK_IN';
            let locationCoords = "Non autorisé ou Timeout";
            try {
                const pos = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 0
                    });
                });
                locationCoords = `${pos.coords.latitude},${pos.coords.longitude}`;
            } catch(e) { console.warn("GPS erreur:", e.message); }
            Swal.fire({ title: 'Enregistrement...', text: 'Liaison avec le serveur sécurisé', didOpen: () => Swal.showLoading(), allowOutsideClick: false });
            const payload = {
                id: currentUser.id, nom: currentUser.nom, action: action, 
                time: new Date().toISOString(), gps: locationCoords, agent: currentUser.nom
            };
            try {
                const response = await secureFetch(URL_CLOCK_ACTION, { 
                    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) 
                });
                if (response.ok) {
                    const newStatus = action === 'CLOCK_IN' ? 'IN' : 'OUT';
                    localStorage.setItem('clock_status_' + currentUser.id, newStatus);
                    updateClockUI(newStatus === 'IN');
                    document.getElementById('clock-last-action').innerText = "Dernière action : " + new Date().toLocaleTimeString();
                    Swal.fire({ 
                        icon: 'success', title: action === 'CLOCK_IN' ? 'Entrée Validée' : 'Sortie Validée', 
                        text: locationCoords.includes("Timeout") ? "Pointage OK (sans GPS)" : "Pointage et GPS OK",
                        timer: 2000, showConfirmButton: false 
                    });
                }
            } catch (e) { Swal.fire('Echec', 'Erreur serveur : ' + e.message, 'error'); }
        }


        














                                        function openFullFolder(id) {
    const e = employees.find(x => x.id === id); if(!e) return;
    
    // Remplissage infos header
    document.getElementById('folder-photo').src = formatGoogleLink(e.photo) || 'https://via.placeholder.com/150';
    document.getElementById('folder-name').innerText = e.nom; 
    document.getElementById('folder-id').innerText = "IDENTIFIANT : " + e.id;
    document.getElementById('folder-poste').innerText = e.poste; 
    document.getElementById('folder-dept').innerText = e.dept;
    document.getElementById('folder-email').innerText = e.email || "Non renseigné"; 
    document.getElementById('folder-phone').innerText = e.telephone || "Non renseigné";
    document.getElementById('folder-address').innerText = e.adresse || "Non renseignée";
    
    if(e.date) { 
        let sD = parseDateSmart(e.date); 
        document.getElementById('folder-start').innerText = sD.toLocaleDateString('fr-FR'); 
        let eD = new Date(sD); eD.setDate(eD.getDate() + (parseInt(e.limit) || 365)); 
        document.getElementById('folder-end').innerText = eD.toLocaleDateString('fr-FR'); 
    }
    
    const grid = document.getElementById('folder-docs-grid'); 
    grid.innerHTML = '';

    // --- CORRECTION : UNE SEULE DÉCLARATION ---
    const docs = [ 
        { label: 'Contrat Actuel', link: e.doc, icon: 'fa-file-signature', color: 'blue', key: 'contrat' }, 
        { label: 'Curriculum Vitae', link: e.cv_link, icon: 'fa-file-pdf', color: 'indigo', key: 'cv' }, 
        { label: 'Lettre Motivation', link: e.lm_link, icon: 'fa-envelope-open-text', color: 'pink', key: 'lm' },
        { label: 'Pièce d\'Identité', link: e.id_card_link, icon: 'fa-id-card', color: 'slate', key: 'id_card' }, 
        { label: 'Diplômes/Certifs', link: e.diploma_link, icon: 'fa-graduation-cap', color: 'emerald', key: 'diploma' },
        { label: 'Attestations / Autres', link: e.attestation_link, icon: 'fa-file-invoice', color: 'orange', key: 'attestation' } 
    ];

    docs.forEach(doc => { 
        const hasLink = doc.link && doc.link !== '#'; 
        grid.innerHTML += `
            <div class="p-4 rounded-2xl border ${hasLink ? 'bg-white shadow-sm border-slate-200' : 'bg-slate-100 opacity-50'} flex items-center justify-between group">
                <div class="flex items-center gap-3">
                    <div class="p-2.5 rounded-xl bg-${doc.color}-50 text-${doc.color}-600"><i class="fa-solid ${doc.icon}"></i></div>
                    <p class="text-xs font-bold text-slate-700">${doc.label}</p>
                </div>
                <div class="flex gap-2">
                    ${hasLink ? `<a href="${doc.link}" target="_blank" class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><i class="fa-solid fa-up-right-from-square"></i></a>` : ''}
                    <button onclick="updateSingleDoc('${doc.key}', '${e.id}')" class="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                </div>
            </div>`; 
    });            
    
    document.getElementById('folder-modal').classList.remove('hidden');
}











        
        
        
        function closeFolderModal() { document.getElementById('folder-modal').classList.add('hidden'); }
  
        





function formatGoogleLink(link) {
    // 1. Sécurité : si vide
    if (!link || link === '#' || link === 'null') {
        return 'https://ui-avatars.com/api/?background=cbd5e1&color=fff&size=128';
    }

    // 2. Nettoyage : On récupère la chaîne de caractères, peu importe si c'est dans un tableau ou non
    let url = link;
    if (Array.isArray(link) && link.length > 0) url = link[0].url || link[0];
    else if (typeof link === 'object' && link.url) url = link.url;
    
    url = String(url);

    // 3. EXTRACTION DE L'ID GOOGLE DRIVE
    // Ça marche pour :
    // - https://drive.google.com/file/d/L_ID_EST_ICI/view
    // - https://drive.google.com/open?id=L_ID_EST_ICI
    const idMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);

    if (idMatch && idMatch[1]) {
        // C'est l'URL magique qui transforme un lien Drive en vraie image affichable
        return `https://lh3.googleusercontent.com/d/${idMatch[1]}`;
    }

    // Si ce n'est pas du Drive, on renvoie l'url telle quelle (cas ou c'est déjà hébergé ailleurs)
    return url;
}















// Nouvelle fonction helper pour extraire juste l'ID (nécessaire pour la preview)
function getDriveId(link) {
    if (!link) return null;
    const str = String(link);
    const match = str.match(/\/d\/([a-zA-Z0-9_-]+)/) || str.match(/id=([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
}














                                                    function loadMyProfile() {
    // On trouve l'employé correspondant à l'utilisateur connecté
    const myData = employees.find(e => e.nom.toLowerCase().includes(currentUser.nom.toLowerCase()));
    
    if (myData) {
        // Remplissage des infos textes
        document.getElementById('emp-name').innerText = myData.nom; 
        document.getElementById('emp-job').innerText = myData.poste;
        
        // Gestion Photo
        if(myData.photo && myData.photo.length > 10) { 
            document.getElementById('emp-photo-real').src = formatGoogleLink(myData.photo); 
            document.getElementById('emp-photo-real').classList.remove('hidden'); 
            document.getElementById('emp-avatar').classList.add('hidden'); 
        }

        // Gestion Dates
        if(myData.date) { 
            let sD = parseDateSmart(myData.date); 
            document.getElementById('emp-start-date').innerText = sD.toLocaleDateString('fr-FR'); 
            let eD = new Date(sD); 
            eD.setDate(eD.getDate() + (parseInt(myData.limit) || 365)); 
            document.getElementById('emp-end-date').innerText = eD.toLocaleDateString('fr-FR'); 
        }

        // Remplissage formulaires
        document.getElementById('emp-email').value = myData.email || ""; 
        document.getElementById('emp-phone').value = myData.telephone || ""; 
        document.getElementById('emp-address').value = myData.adresse || ""; 
        document.getElementById('emp-dob').value = convertToInputDate(myData.date_naissance); 
        
        const dC = document.getElementById('doc-container'); 
        dC.innerHTML = '';

        // --- CORRECTION ICI ---
        // Utilisation de 'myData' et syntaxe propre
        const allDocs = [ 
            { label: 'Contrat Actuel', link: myData.doc, icon: 'fa-file-signature', color: 'blue', key: 'contrat' }, 
            { label: 'Curriculum Vitae', link: myData.cv_link, icon: 'fa-file-pdf', color: 'indigo', key: 'cv' }, 
            { label: 'Lettre Motivation', link: myData.lm_link, icon: 'fa-envelope-open-text', color: 'pink', key: 'lm' },
            { label: 'Pièce d\'Identité', link: myData.id_card_link, icon: 'fa-id-card', color: 'slate', key: 'id_card' }, 
            { label: 'Diplômes/Certifs', link: myData.diploma_link, icon: 'fa-graduation-cap', color: 'emerald', key: 'diploma' },
            { label: 'Attestations', link: myData.attestation_link, icon: 'fa-file-invoice', color: 'orange', key: 'attestation' } 
        ];

        allDocs.forEach(doc => {
            const hasLink = doc.link && doc.link.length > 5 && doc.link !== '#';
            dC.innerHTML += `
                <div class="flex items-center justify-between p-3 border border-slate-100 bg-white rounded-xl hover:bg-slate-50 transition-all group mb-3 shadow-sm">
                    <div class="flex items-center gap-3">
                        <div class="bg-${doc.color}-50 text-${doc.color}-600 p-2.5 rounded-lg"><i class="fa-solid ${doc.icon}"></i></div>
                        <p class="text-xs font-bold text-slate-700">${doc.label}</p>
                    </div>
                    <div class="flex gap-2">
                        ${hasLink ? `<a href="${doc.link}" target="_blank" class="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"><i class="fa-solid fa-up-right-from-square"></i></a>` : ''}
                        <button onclick="updateSingleDoc('${doc.key}', '${myData.id}')" class="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                            <i class="fa-solid fa-file-arrow-up"></i>
                        </button>
                    </div>
                </div>`;
        });
    }
}














        
        function switchView(v){ 
            if(videoStream){ videoStream.getTracks().forEach(t=>t.stop()); videoStream=null; }
            if(contractStream){ contractStream.getTracks().forEach(t=>t.stop()); contractStream=null; }
            document.querySelectorAll('.view-section').forEach(e=>e.classList.remove('active')); 
            document.getElementById('view-'+v).classList.add('active'); 
            document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('bg-blue-600','text-white')); 
            const ab=document.querySelector(`button[onclick="switchView('${v}')"]`); 
            if(ab)ab.classList.add('bg-blue-600','text-white'); 
            if(window.innerWidth<768 && !document.getElementById('sidebar').classList.contains('-translate-x-full')) toggleSidebar(); 
            if(v==='logs') fetchLogs(); 
        }       
       
        function toggleSidebar(){const sb=document.getElementById('sidebar'), o=document.getElementById('sidebar-overlay'); if(sb.classList.contains('-translate-x-full')){sb.classList.remove('-translate-x-full');o.classList.remove('hidden');}else{sb.classList.add('-translate-x-full');o.classList.add('hidden');}}
        function filterTable(){const t=document.getElementById('search-input').value.toLowerCase(); const s=document.querySelector('.view-section.active'); if(s)s.querySelectorAll('tbody tr').forEach(r=>{r.style.display=r.innerText.toLowerCase().includes(t)?'':'none'})}
        function parseDateSmart(d){if(!d)return new Date();if(!isNaN(d)&&!String(d).includes('/'))return new Date((d-25569)*86400000);if(String(d).includes('/')){const p=d.split('/'); return new Date(p[2],p[1]-1,p[0]);}return new Date(d);}
        
        
        function convertToInputDate(dStr){if(!dStr) return ""; if(dStr.match(/^\d{4}-\d{2}-\d{2}$/)) return dStr; if(dStr.includes('/')){const p=dStr.split('/'); return `${p[2]}-${p[1].padStart(2,'0')}-${p[0].padStart(2,'0')}`;} return "";}
        
   





                        // --- OUVRIR LA MODALE D'ADMINISTRATION ---
function openEditModal(id) {
    const e = employees.find(x => x.id === id);
    if (e) {
        // 1. Afficher la modale
        document.getElementById('edit-modal').classList.remove('hidden');
        document.getElementById('edit-id-hidden').value = id;
        
        // 2. Pré-remplir les champs standards
        document.getElementById('edit-statut').value = e.statut || 'Actif';
        
        const roleSelect = document.getElementById('edit-role');
        if(roleSelect) roleSelect.value = e.role || 'EMPLOYEE';
        
        const deptSelect = document.getElementById('edit-dept');
        if(deptSelect) deptSelect.value = e.dept || 'IT & Tech';

        const typeSelect = document.getElementById('edit-type-contrat');
        if(typeSelect) typeSelect.value = e.limit || '365';
        
        // 3. Pré-remplir la DATE DE DÉBUT DE CONTRAT (Nouveau)
        const dateInput = document.getElementById('edit-start-date');
        if (dateInput) {
            // Si l'employé a une date, on la met au format YYYY-MM-DD
            // Sinon, on met la date d'aujourd'hui par défaut
            if (e.date) {
                dateInput.value = convertToInputDate(e.date);
            } else {
                dateInput.value = new Date().toISOString().split('T')[0];
            }
        }

        // 4. Réinitialiser la case à cocher "Forcer l'initialisation"
        const initCheck = document.getElementById('edit-init-check');
        if(initCheck) initCheck.checked = false;
    }
}















async function submitUpdate(e) {
    e.preventDefault(); 
    const id = document.getElementById('edit-id-hidden').value;
    
    // Récupération des valeurs
    const statut = document.getElementById('edit-statut').value;
    const role = document.getElementById('edit-role') ? document.getElementById('edit-role').value : 'EMPLOYEE';
    const dept = document.getElementById('edit-dept') ? document.getElementById('edit-dept').value : '';
    const typeContrat = document.getElementById('edit-type-contrat').value;
    
    // NOUVEAU : Récupération Date & Checkbox
    const newStartDate = document.getElementById('edit-start-date').value;
    const forceInit = document.getElementById('edit-init-check').checked;

    Swal.fire({title: 'Mise à jour...', text: 'Synchronisation...', didOpen: () => Swal.showLoading()}); 

    let urlParams = `id=${id}&agent=${encodeURIComponent(currentUser.nom)}`;
    urlParams += `&statut=${encodeURIComponent(statut)}`;
    urlParams += `&role=${encodeURIComponent(role)}`;
    urlParams += `&dept=${encodeURIComponent(dept)}`;
    urlParams += `&limit=${typeContrat}`;
    
    // On envoie la date et le booléen
    urlParams += `&start_date=${newStartDate}`;
    urlParams += `&force_init=${forceInit ? 'true' : 'false'}`;

    try {
        const response = await secureFetch(`${URL_UPDATE}?${urlParams}`);
        if(response.ok) {
            closeEditModal(); 
            Swal.fire('Succès', 'Contrat et dossier mis à jour', 'success'); 
            refreshAllData();
        } else {
            throw new Error("Erreur serveur");
        }
    } catch(e) { 
        Swal.fire('Erreur', e.message, 'error'); 
    }
}









       
       
        function closeEditModal(){document.getElementById('edit-modal').classList.add('hidden');}
        
       async function printBadge(id) {
            const e = employees.find(x => x.id === id); 
            if(!e) return; 
            
            // On récupère le token
            const token = localStorage.getItem('sirh_token');
            
            Swal.fire({title:'Génération...', didOpen:()=>Swal.showLoading()});

            try {
                // On construit l'URL
                const url = `${URL_BADGE_GEN}?id=${encodeURIComponent(id)}&nom=${encodeURIComponent(e.nom)}&poste=${encodeURIComponent(e.poste)}&photo=${encodeURIComponent(formatGoogleLink(e.photo)||'')}&agent=${encodeURIComponent(currentUser.nom)}&token=${token}`;

                // AU LIEU DE FAIRE window.open(url)...
                // On va chercher le contenu (le code HTML du badge)
                const response = await fetch(url);
                
                if (!response.ok) throw new Error("Erreur génération");

                // On récupère le texte HTML
                const htmlContent = await response.text();

                // On ferme le loader
                Swal.close();

                // On ouvre une fenêtre vide
                const w = window.open('', '_blank', 'width=400,height=600');
                
                // On écrit le HTML dedans manuellement
                w.document.open();
                w.document.write(htmlContent);
                w.document.close();

                // Petit délai pour laisser les images charger avant d'imprimer (si le HTML contient un script d'impression auto, ça marchera aussi)
                w.onload = function() {
                    // Optionnel : forcer l'impression si le HTML ne le fait pas déjà
                    // w.print();
                };

            } catch (error) {
                console.error(error);
                Swal.fire('Erreur', 'Impossible de générer le badge : ' + error.message, 'error');
            }
        }
        
        async function startCameraFeed(){try{videoStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user'}});const v=document.getElementById('video-stream');v.srcObject=videoStream;v.classList.remove('hidden');document.getElementById('captured-image').classList.add('hidden');document.getElementById('btn-capture').classList.remove('hidden');document.getElementById('initial-controls').classList.add('hidden');document.getElementById('photo-placeholder').classList.add('hidden');}catch(e){Swal.fire('Erreur', 'Caméra bloquée', 'error');}}
        function handleFileUpload(e){const f=e.target.files[0];if(f){capturedBlob=f;const i=document.getElementById('captured-image');i.src=URL.createObjectURL(f);i.classList.remove('hidden');document.getElementById('video-stream').classList.add('hidden');document.getElementById('initial-controls').classList.add('hidden');document.getElementById('btn-retake').classList.remove('hidden');document.getElementById('photo-placeholder').classList.add('hidden');}}
        
        function takeSnapshot(){
            const v=document.getElementById('video-stream'),c=document.getElementById('camera-canvas');
            c.width=v.videoWidth;c.height=v.videoHeight;
            c.getContext('2d').drawImage(v,0,0);
            c.toBlob(b=>{
                capturedBlob=b;
                const i=document.getElementById('captured-image');
                i.src=URL.createObjectURL(b);
                i.classList.remove('hidden');
                v.classList.add('hidden');
                document.getElementById('btn-capture').classList.add('hidden');
                document.getElementById('btn-retake').classList.remove('hidden');
                if(videoStream){ videoStream.getTracks().forEach(t => t.stop()); videoStream = null; }
            },'image/jpeg',0.8);
        }       
       
        function resetCamera(){document.getElementById('captured-image').classList.add('hidden');document.getElementById('btn-retake').classList.add('hidden');document.getElementById('btn-capture').classList.add('hidden');document.getElementById('video-stream').classList.add('hidden');document.getElementById('initial-controls').classList.remove('hidden');document.getElementById('file-upload').value='';document.getElementById('photo-placeholder').classList.remove('hidden');capturedBlob=null;if(videoStream){videoStream.getTracks().forEach(t=>t.stop());videoStream=null;}}
        function triggerPhotoUpload(){document.getElementById('emp-upload-photo').click();}
        function previewPhoto(e){const f=e.target.files[0];if(f){const r=new FileReader();r.onload=function(ev){document.getElementById('emp-photo-real').src=ev.target.result;document.getElementById('emp-photo-real').classList.remove('hidden');document.getElementById('emp-avatar').classList.add('hidden');document.getElementById('save-btn-container').classList.remove('hidden');};r.readAsDataURL(f);}}
        
        
        function toggleEditMode(){const ids=['emp-email','emp-phone','emp-address','emp-dob'], btn=document.getElementById('save-btn-container'), dis=document.getElementById('emp-email').disabled; ids.forEach(i=>{const el=document.getElementById(i); el.disabled=!dis; if(!dis)el.classList.add('bg-white','ring-2','ring-blue-100'); else el.classList.remove('bg-white','ring-2','ring-blue-100');}); if(dis){btn.classList.remove('hidden');document.getElementById('emp-email').focus();}else{btn.classList.add('hidden');loadMyProfile();}}
        
async function saveMyProfile() {
    Swal.fire({ title: 'Sauvegarde...', didOpen: () => Swal.showLoading() });

    // On récupère le MATRICULE (ex: BA-47889) pour que Make trouve le bon dossier
    const myData = employees.find(e => e.nom.toLowerCase().includes(currentUser.nom.toLowerCase()));

    const fd = new FormData();
    fd.append('id', myData ? myData.id : currentUser.id); // On envoie le matricule à Make
    fd.append('email', document.getElementById('emp-email').value);
    fd.append('phone', document.getElementById('emp-phone').value);
    fd.append('address', document.getElementById('emp-address').value);
    fd.append('dob', document.getElementById('emp-dob').value);
    fd.append('agent', currentUser.nom);
    fd.append('doc_type', 'text_update'); // Dit à Make que c'est une modif de texte uniquement

    const pI = document.getElementById('emp-upload-photo');
    if (pI.files[0]) {
        // "new_photo" car c'est le nom utilisé dans le filtre de ton scénario Make
        fd.append('new_photo', pI.files[0]); 
    }

    try {
        const response = await secureFetch(URL_EMPLOYEE_UPDATE, { 
            method: 'POST', 
            body: fd 
        });
        
        if (response.ok) {
            Swal.fire('Succès', 'Votre profil a été mis à jour', 'success');
            toggleEditMode(); // Verrouille les champs
            refreshAllData(); // Recharge les données et les graphiques
        } else {
            throw new Error("Erreur serveur");
        }
    } catch (e) {
        Swal.fire('Erreur', 'Échec de l\'enregistrement : ' + e.message, 'error');
    }
}       







                                    async function handleOnboarding(e) {
            e.preventDefault();
            console.log("Tentative de création de profil...");

            // 1. Vérification de la photo de profil (Obligatoire)
            if (!capturedBlob) {
                return Swal.fire('Attention', 'La photo de profil est obligatoire pour créer un compte.', 'warning');
            }

            const fd = new FormData();

            try {
                // 2. Récupération sécurisée des champs texte
                // On vérifie que les éléments existent avant de lire .value
                const getVal = (id) => {
                    const el = document.getElementById(id);
                    return el ? el.value : "";
                };

                fd.append('nom', getVal('f-nom'));
                fd.append('email', getVal('f-email'));
                fd.append('telephone', getVal('f-phone'));
                fd.append('dob', getVal('f-dob'));
                fd.append('adresse', getVal('f-address'));
                fd.append('date', getVal('f-date'));
                fd.append('poste', getVal('f-poste'));
                fd.append('dept', getVal('f-dept'));
                fd.append('limit', getVal('f-limit'));
                fd.append('role', getVal('f-role'));
                fd.append('agent', currentUser ? currentUser.nom : "Système");

                // 3. Ajout de la photo de profil (Obligatoire)
                fd.append('photo', capturedBlob, 'photo_profil.jpg');

                // 4. Ajout des documents KYC (Optionnels)
                // IMPORTANT : On vérifie s'ils existent AVANT de les ajouter
                if (docBlobs.id_card) fd.append('id_card', docBlobs.id_card, 'piece_identite.jpg');
                if (docBlobs.cv) fd.append('cv', docBlobs.cv, 'cv.jpg');
                if (docBlobs.diploma) fd.append('diploma', docBlobs.diploma, 'diplome.jpg');
                if (docBlobs.attestation) fd.append('attestation', docBlobs.attestation, 'attestation.jpg');

                // 5. Affichage du chargement
                Swal.fire({
                    title: 'Création du dossier...',
                    text: 'Envoi des informations et des documents au serveur sécurisé',
                    didOpen: () => Swal.showLoading(),
                    allowOutsideClick: false
                });

                // 6. Envoi au serveur Render
                const response = await secureFetch(URL_WRITE_POST, {
                    method: 'POST',
                    body: fd
                });

                if (response.ok) {
                    await Swal.fire({
                        icon: 'success',
                        title: 'Profil créé !',
                        text: 'Le collaborateur a été ajouté et ses accès ont été envoyés par email.',
                        confirmButtonColor: '#2563eb'
                    });
                    location.reload(); // Recharge pour voir le nouveau membre
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.error || "Erreur serveur");
                }

            } catch (error) {
                console.error("Erreur lors de l'onboarding:", error);
                Swal.fire('Échec', "Impossible de créer le profil : " + error.message, 'error');
            }
        }












        function startScanner(){
            let scannerInstance = null;
            Swal.fire({
                title:'SCANNER', html:'<div id="reader"></div>',
                didOpen:()=>{
                    scannerInstance = new Html5Qrcode("reader");
                    scannerInstance.start({facingMode:"environment"},{fps:10},d=>{
                        scannerInstance.stop().then(() => {
                            let id=d; try{id=new URL(d).searchParams.get("id")}catch(e){} 
                            secureFetch(`${URL_GATEKEEPER}?id=${encodeURIComponent(id)}&key=${SCAN_KEY}&agent=${encodeURIComponent(currentUser.nom)}`)
                            .then(r=>r.json()).then(d=>{
                                if(d.status==="valid") Swal.fire('ACCÈS OK',d.nom,'success'); 
                                else {Swal.fire({icon:'error',title:'REFUSÉ'}).then(()=>location.href=URL_REDIRECT_FAILURE);}
                            });
                        });
                    });
                },
                willClose: () => { if(scannerInstance) { scannerInstance.stop().catch(err => console.log("Stop Qr")); } }
            }); 
        }
        








                                                                     async function fetchLogs() {
            const tbody = document.getElementById('logs-body');
            tbody.innerHTML = '<tr><td colspan="4" class="p-6 text-center italic text-slate-400">Chargement...</td></tr>';
            try {
                const res = await secureFetch(`${URL_READ_LOGS}?agent=${encodeURIComponent(currentUser.nom)}`); 
                const raw = await res.json();
                tbody.innerHTML = '';
                [...raw].reverse().forEach(log => {
                    let date, agent, action, details;
                    if (Array.isArray(log)) { date=log[0]; agent=log[1]; action=log[2]; details=log[4]; } 
                    else { date=log.date||log.Timestamp||log.created_at; agent=log.agent||'Système'; action=log.action||'-'; details=log.détails||log.details||'-'; }
                    const dF = date ? new Date(date).toLocaleString('fr-FR', {day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}) : '-';
                    
                    // UTILISATION DE escapeHTML ICI
                    tbody.innerHTML += `<tr class="border-b"><td class="p-4 text-xs font-mono">${dF}</td><td class="p-4 font-bold text-slate-700">${escapeHTML(agent)}</td><td class="p-4"><span class="bg-blue-50 text-blue-600 px-2 py-1 rounded text-[10px] font-black">${escapeHTML(action)}</span></td><td class="p-4 text-xs text-slate-500">${escapeHTML(details)}</td></tr>`;
                });
            } catch(e) { tbody.innerHTML = `<tr><td colspan="4" class="text-red-500 p-4 font-bold text-center">${escapeHTML(e.message)}</td></tr>`; }
        }







        
        function generateDraftContract(id) { 
            const e = employees.find(x => x.id === id); if(!e) return; 
            const token = localStorage.getItem('sirh_token');
            window.open(`${URL_CONTRACT_GENERATE}?id=${encodeURIComponent(id)}&nom=${encodeURIComponent(e.nom)}&poste=${encodeURIComponent(e.poste)}&date=${encodeURIComponent(e.date)}&agent=${encodeURIComponent(currentUser.nom)}&token=${token}`, '_blank'); 
        }
        
        function openContractModal(id) { document.getElementById('contract-id-hidden').value = id; document.getElementById('contract-modal').classList.remove('hidden'); resetContractCamera(); }
        function closeContractModal() { if(contractStream) contractStream.getTracks().forEach(t => t.stop()); document.getElementById('contract-modal').classList.add('hidden'); }
        async function startContractCamera() { try { contractStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }); const v = document.getElementById('contract-video'); v.srcObject = contractStream; v.classList.remove('hidden'); document.getElementById('contract-img-preview').classList.add('hidden'); document.getElementById('contract-icon').classList.add('hidden'); document.getElementById('btn-contract-capture').classList.remove('hidden'); } catch(e) { Swal.fire('Erreur', 'Caméra inaccessible', 'error'); } }
        
        function takeContractSnapshot() { 
            const v = document.getElementById('contract-video'); const c = document.createElement('canvas'); 
            c.width = v.videoWidth; c.height = v.videoHeight; c.getContext('2d').drawImage(v, 0, 0); 
            c.toBlob(blob => { 
                contractBlob = blob; const img = document.getElementById('contract-img-preview'); 
                img.src = URL.createObjectURL(blob); img.classList.remove('hidden'); v.classList.add('hidden'); 
                document.getElementById('btn-contract-capture').classList.add('hidden'); 
                if(contractStream) { contractStream.getTracks().forEach(t => t.stop()); contractStream = null; }
            }, 'image/jpeg', 0.8); 
        }
        
        function previewContractFile(e) { const file = e.target.files[0]; if(!file) return; contractBlob = file; if(file.type.includes('image')) { const img = document.getElementById('contract-img-preview'); img.src = URL.createObjectURL(file); img.classList.remove('hidden'); document.getElementById('contract-icon').classList.add('hidden'); } }
        function resetContractCamera() { contractBlob = null; document.getElementById('contract-img-preview').classList.add('hidden'); document.getElementById('contract-video').classList.add('hidden'); document.getElementById('contract-icon').classList.remove('hidden'); document.getElementById('btn-contract-capture').classList.add('hidden'); if(contractStream) contractStream.getTracks().forEach(t => t.stop()); }
        
        async function submitSignedContract() { 
            if(!contractBlob && !document.getElementById('contract-upload').files[0]) { Swal.fire('Erreur', 'Document requis', 'warning'); return; } 
            const id = document.getElementById('contract-id-hidden').value; 
            Swal.fire({ title: 'Upload...', didOpen: () => Swal.showLoading() }); 
            const fd = new FormData(); fd.append('id', id); fd.append('contract_file', contractBlob || document.getElementById('contract-upload').files[0], 'contrat.jpg'); fd.append('agent', currentUser.nom);
            try { const r = await secureFetch(URL_UPLOAD_SIGNED_CONTRACT, { method: 'POST', body: fd }); if(r.ok) { Swal.fire('Succès', 'Contrat enregistré', 'success'); closeContractModal(); refreshAllData(); } } catch(e) { Swal.fire('Erreur', e.message, 'error'); } 
        }
        
 function showLeaveDetail(nom, type, debut, fin, motif, encodedLink) {
    const docLink = decodeURIComponent(encodedLink);
    let documentHtml = '';
    
    // On récupère l'ID Drive pour construire le mode "Preview"
    const driveId = getDriveId(docLink);

    if (driveId) {
        // C'est un lien Google Drive valide -> ON AFFICHE LA PREVIEW
        const previewUrl = `https://drive.google.com/file/d/${driveId}/preview`;
        
        documentHtml = `
            <div class="mt-6 pt-4 border-t border-slate-100 animate-fadeIn">
                <p class="text-[10px] font-black text-slate-400 uppercase mb-3 flex justify-between items-center">
                    <span>Aperçu du justificatif</span>
                    <a href="${docLink}" target="_blank" class="text-blue-600 hover:underline cursor-pointer"><i class="fa-solid fa-expand mr-1"></i>Ouvrir en grand</a>
                </p>
                
                <!-- ZONE DE PREVIEW -->
                <div class="rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100 relative group">
                    <iframe src="${previewUrl}" width="100%" height="250" style="border:none;" allow="autoplay"></iframe>
                    
                    <!-- Overlay au survol pour inciter à cliquer si besoin -->
                    <div class="absolute inset-0 bg-black/0 group-hover:bg-black/5 pointer-events-none transition-all"></div>
                </div>
            </div>
        `;
    } 
    else if (docLink && docLink !== 'null' && docLink.length > 5) {
        // Lien existe mais pas Google Drive (ex: lien direct image serveur)
        documentHtml = `
            <div class="mt-6 pt-4 border-t border-slate-100">
                <p class="text-[10px] font-black text-slate-400 uppercase mb-3">Justificatif</p>
                <div class="text-center">
                    <img src="${docLink}" class="max-h-48 rounded-lg mx-auto border shadow-sm cursor-pointer hover:scale-105 transition-transform" 
                         onclick="Swal.fire({imageUrl: '${docLink}', showConfirmButton: false, width: '90vw'})" 
                         alt="Justificatif" 
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
                    
                    <!-- Fallback si l'image ne charge pas -->
                    <a href="${docLink}" target="_blank" style="display:none" class="flex items-center gap-3 p-3 border rounded-xl bg-slate-50 hover:bg-slate-100">
                        <i class="fa-solid fa-paperclip text-slate-400"></i>
                        <span class="text-sm font-bold text-slate-700">Voir le fichier</span>
                    </a>
                </div>
            </div>
        `;
    } 
    else {
        // Aucun document
        documentHtml = `
            <div class="mt-6 pt-4 border-t border-slate-100">
                <p class="text-[10px] font-black text-slate-400 uppercase mb-2">Pièce Justificative</p>
                <div class="flex items-center gap-2 p-3 rounded-xl border border-dashed border-slate-200 text-slate-400 bg-slate-50/50">
                    <i class="fa-solid fa-file-circle-xmark"></i>
                    <span class="text-xs font-bold">Aucun document fourni</span>
                </div>
            </div>
        `;
    }

    // Affichage de la modale
    Swal.fire({
        html: `
            <div class="text-left font-sans">
                <div class="flex justify-between items-start mb-6 border-b border-slate-100 pb-4">
                    <div>
                        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Collaborateur</p>
                        <h3 class="font-extrabold text-lg text-slate-800 m-0 leading-tight">${nom}</h3>
                    </div>
                    <div class="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide border border-blue-100">
                        ${type}
                    </div>
                </div>

                <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-4">
                    <div class="grid grid-cols-2 gap-4 text-center">
                        <div class="border-r border-slate-200">
                            <p class="text-[9px] font-black text-slate-400 uppercase mb-1">Du (Matin)</p>
                            <p class="font-bold text-sm text-slate-700 m-0">${debut}</p>
                        </div>
                        <div>
                            <p class="text-[9px] font-black text-slate-400 uppercase mb-1">Au (Soir)</p>
                            <p class="font-bold text-sm text-slate-700 m-0">${fin}</p>
                        </div>
                    </div>
                </div>

                <div>
                    <p class="text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Motif</p>
                    <div class="bg-white p-4 rounded-xl text-sm text-slate-600 border border-slate-200 italic shadow-sm">
                        "${motif}"
                    </div>
                </div>
                
                ${documentHtml}
            </div>
        `,
        showConfirmButton: true,
        confirmButtonText: 'Fermer',
        confirmButtonColor: '#0f172a',
        width: 600, // Un peu plus large pour bien voir le document
        padding: '1.5rem',
        customClass: {
            popup: 'rounded-[2rem]'
        }
    });
}













function handleLogout() {
            if(videoStream) videoStream.getTracks().forEach(t => t.stop());
            if(contractStream) contractStream.getTracks().forEach(t => t.stop());
            
            // NETTOYAGE COMPLET
            localStorage.removeItem('sirh_token');
            localStorage.removeItem('sirh_user_session'); // Supprime l'identité sauvegardée
            
            location.reload();
        }












        window.addEventListener('offline', () => { Swal.fire({ icon: 'warning', title: 'Connexion Perdue', text: 'Mode hors ligne.', toast: true, position: 'top-end', showConfirmButton: false, timer: 5000 }); document.body.classList.add('offline-mode'); });
        window.addEventListener('online', () => { Swal.fire({ icon: 'success', title: 'Connexion Rétablie', text: 'Opérationnel.', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 }); document.body.classList.remove('offline-mode'); });
    
    
    
    
    
    
        function renderCharts() {
        // 1. Calcul des données par Statut
        const statusCounts = {};
        employees.forEach(e => { statusCounts[e.statut] = (statusCounts[e.statut] || 0) + 1; });

        // 2. Calcul des données par Département
        const deptCounts = {};
        employees.forEach(e => { deptCounts[e.dept] = (deptCounts[e.dept] || 0) + 1; });

        // Graphique Statut (Pie)
        if (chartStatusInstance) chartStatusInstance.destroy();
        const ctxStatus = document.getElementById('chartStatus').getContext('2d');
        chartStatusInstance = new Chart(ctxStatus, {
            type: 'doughnut',
            data: {
                labels: Object.keys(statusCounts),
                datasets: [{
                    data: Object.values(statusCounts),
                    backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#6366f1'],
                    borderWidth: 0
                }]
            },
            options: { plugins: { legend: { position: 'bottom' } }, cutout: '70%' }
        });

        // Graphique Département (Bar)
        if (chartDeptInstance) chartDeptInstance.destroy();
        const ctxDept = document.getElementById('chartDept').getContext('2d');
        chartDeptInstance = new Chart(ctxDept, {
            type: 'bar',
            data: {
                labels: Object.keys(deptCounts),
                datasets: [{
                    label: 'Nombre d\'employés',
                    data: Object.values(deptCounts),
                    backgroundColor: '#6366f1',
                    borderRadius: 8
                }]
            },
            options: { 
                scales: { y: { beginAtZero: true, grid: { display: false } }, x: { grid: { display: false } } },
                plugins: { legend: { display: false } }
            }
        });
    }
   



                             async function fetchLeaveRequests() {
    if (!currentUser || currentUser.role === 'EMPLOYEE') return;
    
    const body = document.getElementById('leave-requests-body');
    const section = document.getElementById('manager-leave-section');
    
    body.innerHTML = '<tr><td colspan="3" class="p-4 text-center italic text-slate-400">Chargement des demandes...</td></tr>';

    try {
        const r = await secureFetch(`${URL_READ_LEAVES}?agent=${encodeURIComponent(currentUser.nom)}`);
        if (!r.ok) throw new Error("Erreur réseau Make");

        let leaves = await r.json();
        if (!Array.isArray(leaves)) leaves = []; 

        const pending = leaves.filter(l => l.statut === 'En attente');
        body.innerHTML = '';

        if (pending.length > 0) {
            section.classList.remove('hidden');

            pending.forEach(l => {
                const safeNom = encodeURIComponent(l.nom || "Inconnu");
                const safeMotif = encodeURIComponent(l.motif || "Aucun motif");
                
                // Recherche du lien document
                let rawDoc = l.justificatif_link || l.justificatif || l.pj || l.attachment || l.url;
                let docLink = '';
                if (Array.isArray(rawDoc) && rawDoc.length > 0) rawDoc = rawDoc[0].url || rawDoc[0];
                if (rawDoc && rawDoc !== 'null' && rawDoc !== '#') {
                    docLink = formatGoogleLink(rawDoc);
                }

                body.innerHTML += `
                <tr class="border-b hover:bg-slate-50 transition-colors">
                    <td class="px-8 py-4 font-bold text-sm text-slate-700">${l.nom}</td>
                    <td class="px-8 py-4 text-xs text-slate-500">
                        ${l.debut} <span class="text-slate-300 mx-1">➔</span> ${l.fin}
                    </td>
                    <td class="px-8 py-4 text-right flex justify-end items-center gap-2">
                        <button onclick="showLeaveDetailFromSafeData('${safeNom}', '${l.type}', '${l.debut}', '${l.fin}', '${safeMotif}', '${encodeURIComponent(docLink)}')" 
                                class="w-8 h-8 flex items-center justify-center text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all">
                            <i class="fa-solid fa-eye"></i>
                        </button>
                        <button onclick="processLeave('${l.record_id}', 'Validé')" class="bg-emerald-100 text-emerald-700 hover:bg-emerald-600 hover:text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase">OUI</button>
                        <button onclick="processLeave('${l.record_id}', 'Refusé')" class="bg-red-50 text-red-600 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase">NON</button>
                    </td>
                </tr>`;
            });
        } else { 
            section.classList.add('hidden'); 
        }
    } catch (e) { 
        console.error("ERREUR:", e);
        body.innerHTML = `<tr><td colspan="3" class="text-center text-red-500 p-4">Erreur : ${e.message}</td></tr>`;
    }
}










// Nouvelle fonction intermédiaire pour décoder les données sécurisées
function showLeaveDetailFromSafeData(safeNom, type, debut, fin, safeMotif, safeDocLink) {
    const nom = decodeURIComponent(safeNom);
    const motif = decodeURIComponent(safeMotif);
    const docLink = safeDocLink ? decodeURIComponent(safeDocLink) : null;
    
    // Appel de la vraie fonction d'affichage
    showLeaveDetail(nom, type, debut, fin, motif, docLink);
}





async function processLeave(recordId, decision) {
    // 1. Demander confirmation à l'utilisateur
    const confirmation = await Swal.fire({
        title: decision === 'Validé' ? 'Approuver ce congé ?' : 'Refuser ce congé ?',
        text: "L'employé sera informé de cette décision.",
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Oui, confirmer',
        cancelButtonText: 'Annuler',
        confirmButtonColor: decision === 'Validé' ? '#10b981' : '#ef4444'
    });

    if (confirmation.isConfirmed) {
        // 2. Afficher un chargement
        Swal.fire({ 
            title: 'Traitement en cours...', 
            allowOutsideClick: false, 
            didOpen: () => Swal.showLoading() 
        });

        try {
            // 3. Envoyer l'ordre au serveur Render -> Make
            const response = await secureFetch(URL_LEAVE_ACTION, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    id: recordId, 
                    decision: decision, 
                    agent: currentUser.nom 
                })
            });

            if (response.ok) {
                // 4. Succès
                await Swal.fire({
                    icon: 'success',
                    title: 'Terminé',
                    text: `La demande a été marquée comme ${decision.toLowerCase()}.`,
                    timer: 2000
                });
                
                // 5. Rafraîchir le tableau des congés pour faire disparaître la ligne traitée
                fetchLeaveRequests(); 
            } else {
                throw new Error("Erreur du serveur");
            }
        } catch (e) {
            console.error("Erreur action congé:", e);
            Swal.fire('Erreur', "Impossible de valider l'action : " + e.message, 'error');
        }
    }
}





// Fonction pour choisir entre Caméra et Fichier via une alerte
function openDocCamera(target) {
    Swal.fire({
        title: 'Source du document',
        text: "Voulez-vous prendre une photo ou choisir un fichier ?",
        showCancelButton: true,
        confirmButtonText: '📸 Caméra',
        cancelButtonText: '📁 Fichier',
        confirmButtonColor: '#2563eb'
    }).then((result) => {
        if (result.isConfirmed) {
            startGenericCamera(target);
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            document.getElementById('f-' + target).click();
        }
    });
}

// Démarre la caméra pour n'importe quel doc
async function startGenericCamera(target) {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        Swal.fire({
            title: 'Capture',
            html: `<video id="temp-video" autoplay playsinline class="w-full rounded-xl"></video>`,
            confirmButtonText: 'CAPTURER',
            showCancelButton: true,
            didOpen: () => { document.getElementById('temp-video').srcObject = stream; }
        }).then((result) => {
            if (result.isConfirmed) {
                const video = document.getElementById('temp-video');
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth; canvas.height = video.videoHeight;
                canvas.getContext('2d').drawImage(video, 0, 0);
                canvas.toBlob(blob => {
                    saveDoc(target, blob);
                    stream.getTracks().forEach(t => t.stop());
                }, 'image/jpeg', 0.8);
            } else {
                stream.getTracks().forEach(t => t.stop());
            }
        });
    } catch (e) { Swal.fire('Erreur', 'Caméra inaccessible', 'error'); }
}

// Aperçu et stockage du fichier (qu'il vienne du PC ou de la Caméra)
function previewDocFile(event, target) {
    const file = event.target.files[0];
    if (file) saveDoc(target, file);
}

function saveDoc(target, fileOrBlob) {
    docBlobs[target] = fileOrBlob;
    const preview = document.getElementById('preview-' + target);
    const icon = document.getElementById('icon-' + target);
    
    if(preview) { // Si on est dans le formulaire onboarding
        preview.src = URL.createObjectURL(fileOrBlob);
        preview.classList.remove('hidden');
        if(icon) icon.classList.add('hidden');
    } else if(target === 'leave_justif') { // Si on est dans les congés
        document.getElementById('leave-doc-preview').innerHTML = '<i class="fa-solid fa-check text-emerald-500"></i>';
    }
}




 async function updateSingleDoc(docKey, employeeId) {
    const { value: file } = await Swal.fire({
        title: 'Mettre à jour le document',
        input: 'file',
        inputAttributes: { 'accept': 'image/*,application/pdf' },
        showCancelButton: true,
        confirmButtonText: 'Uploader',
        cancelButtonColor: '#ef4444',
        confirmButtonColor: '#2563eb'
    });

    if (file) {
        Swal.fire({ title: 'Envoi...', didOpen: () => Swal.showLoading(), allowOutsideClick: false });
        const fd = new FormData();
        fd.append('id', employeeId);
        fd.append('agent', currentUser.nom);
        fd.append('new_photo', file); // On utilise le même champ binaire que ton scénario
        fd.append('doc_type', docKey); // <--- C'est ça qui ne sera plus "undefined" !

        try {
            const r = await secureFetch(URL_EMPLOYEE_UPDATE, { method: 'POST', body: fd });
            if (r.ok) {
                Swal.fire('Succès', 'Document mis à jour', 'success');
                refreshAllData();
            }
        } catch (e) { Swal.fire('Erreur', e.message, 'error'); }
    }
}














async function fetchCandidates() {
    const body = document.getElementById('candidates-body');
    // Petit loader sympa
    body.innerHTML = '<tr><td colspan="4" class="p-8 text-center"><i class="fa-solid fa-circle-notch fa-spin text-blue-600 text-2xl"></i><p class="text-xs text-slate-400 mt-2 font-bold uppercase">Chargement des talents...</p></td></tr>';

    try {
        const r = await secureFetch(`${URL_READ_CANDIDATES}?agent=${encodeURIComponent(currentUser.nom)}`);
        
        // On récupère la réponse
        let rawData = await r.json();
        
        // DEBUG : Regardez dans votre console (F12) ce qui s'affiche ici
        console.log("CANDIDATS REÇUS (BRUT) :", rawData);

        let candidates = [];

        // CAS 1 : C'est déjà une liste parfaite (Cas idéal avec Array Aggregator)
        if (Array.isArray(rawData)) {
            candidates = rawData;
        } 
        // CAS 2 : C'est un objet unique (Make sans Aggregator)
        else if (typeof rawData === 'object' && rawData !== null) {
            // Si l'objet contient une propriété "nom" ou "id", c'est un candidat seul
            if (rawData.nom || rawData.record_id || rawData.id) {
                candidates = [rawData];
            } 
            // CAS 3 : Make renvoie parfois { "items": [...] } ou { "data": [...] }
            else if (rawData.items && Array.isArray(rawData.items)) {
                candidates = rawData.items;
            }
            else if (rawData.data && Array.isArray(rawData.data)) {
                candidates = rawData.data;
            }
        }

        console.log("CANDIDATS TRAITÉS (LISTE) :", candidates);

        body.innerHTML = '';

        if (candidates.length === 0) {
            body.innerHTML = '<tr><td colspan="4" class="p-8 text-center text-slate-400 font-bold bg-slate-50 rounded-xl border border-dashed border-slate-200">Aucune candidature en attente</td></tr>';
            return;
        }

        // Boucle d'affichage
        candidates.forEach(c => {
            const safeNom = encodeURIComponent(c.nom || "Inconnu");
            
            // Sécurisation des liens documents
            const cvLink = c.cv_link ? encodeURIComponent(formatGoogleLink(c.cv_link)) : '';
            const lmLink = c.lm_link ? encodeURIComponent(formatGoogleLink(c.lm_link)) : '';
            const dipLink = c.diploma_link ? encodeURIComponent(formatGoogleLink(c.diploma_link)) : '';
            const attLink = c.attestation_link ? encodeURIComponent(formatGoogleLink(c.attestation_link)) : '';

            // Gestion du Statut (Couleurs)
            let badgeClass = 'bg-slate-100 text-slate-600';
            let st = c.statut || 'Nouveau';
            
            if(st === 'Entretien') badgeClass = 'bg-blue-100 text-blue-700';
            else if(st === 'Embauché' || st === 'Validé') badgeClass = 'bg-emerald-100 text-emerald-700';
            else if(st.includes('Refus')) badgeClass = 'bg-red-50 text-red-500';
            else if(st === 'Nouveau') badgeClass = 'bg-yellow-50 text-yellow-700';

            const btnDocs = `
                <button onclick="showCandidateDocs('${safeNom}', '${c.poste || 'Candidat'}', '${cvLink}', '${lmLink}', '${dipLink}', '${attLink}')" 
                        class="p-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:text-blue-600 hover:border-blue-200 shadow-sm transition-all mr-2" title="Ouvrir le dossier">
                    <i class="fa-solid fa-folder-open"></i>
                </button>
            `;

            let actionButtons = '';

            // Logique des boutons d'action selon le statut
            if (st === 'Nouveau' || !c.statut) {
                actionButtons = `
                    ${btnDocs}
                    <button onclick="handleCandidateAction('${c.record_id}', 'VALIDER_POUR_ENTRETIEN')" class="bg-blue-600 text-white hover:bg-blue-700 px-3 py-2 rounded-lg text-[10px] font-bold uppercase shadow-md shadow-blue-200 transition-all mr-2"><i class="fa-solid fa-calendar-check mr-1"></i> Entretien</button>
                    <button onclick="handleCandidateAction('${c.record_id}', 'REFUS_IMMEDIAT')" class="bg-white border border-red-100 text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg text-[10px] font-bold uppercase transition-all"><i class="fa-solid fa-xmark mr-1"></i> Refus</button>
                `;
            } else if (st === 'Entretien') {
                actionButtons = `
                    ${btnDocs}
                    <button onclick="handleCandidateAction('${c.record_id}', 'ACCEPTER_EMBAUCHE')" class="bg-emerald-500 text-white hover:bg-emerald-600 px-3 py-2 rounded-lg text-[10px] font-bold uppercase shadow-md shadow-emerald-200 transition-all mr-2"><i class="fa-solid fa-user-plus mr-1"></i> Embaucher</button>
                    <button onclick="handleCandidateAction('${c.record_id}', 'REFUS_APRES_ENTRETIEN')" class="bg-white border border-orange-100 text-orange-500 hover:bg-orange-50 px-3 py-2 rounded-lg text-[10px] font-bold uppercase transition-all"><i class="fa-solid fa-thumbs-down mr-1"></i> Refus</button>
                `;
            } else {
                actionButtons = `${btnDocs} <span class="text-[10px] font-bold text-slate-300 italic">Dossier Traité</span>`;
            }

            body.innerHTML += `
            <tr class="border-b hover:bg-slate-50 transition-colors group">
                <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">${c.nom ? c.nom.charAt(0) : '?'}</div>
                        <div>
                            <div class="font-bold text-sm text-slate-800">${c.nom}</div>
                            <div class="text-[10px] text-slate-400 font-mono">${c.email}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-tight">${c.poste || 'Non précisé'}</td>
                <td class="px-6 py-4 text-center">
                    <span class="${badgeClass} px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wide border border-black/5 shadow-sm">${st}</span>
                </td>
                <td class="px-6 py-4 text-right flex justify-end items-center">
                    ${actionButtons}
                </td>
            </tr>`;
        });

    } catch (e) {
        console.error("Erreur Candidats:", e);
        body.innerHTML = `<tr><td colspan="4" class="p-6 text-center text-red-500 font-bold text-sm bg-red-50 rounded-xl border border-red-100">Erreur de chargement : ${e.message}</td></tr>`;
    }
}













// --- POPUP DOSSIER (4 ONGLETS) ---
function showCandidateDocs(safeNom, poste, cv, lm, dip, att) {
    const nom = decodeURIComponent(safeNom);
    const docs = {
        'cv': cv ? decodeURIComponent(cv) : null,
        'lm': lm ? decodeURIComponent(lm) : null,
        'dip': dip ? decodeURIComponent(dip) : null,
        'att': att ? decodeURIComponent(att) : null
    };

    // Helper pour afficher l'iframe Google Preview
    const getViewer = (link) => {
        if (!link || link.length < 5 || link.includes('ui-avatars')) return `<div class="h-64 flex items-center justify-center text-slate-400 italic bg-slate-50 rounded-xl border border-dashed">Document non fourni</div>`;
        const driveId = getDriveId(link);
        const url = driveId ? `https://drive.google.com/file/d/${driveId}/preview` : link;
        return `<iframe src="${url}" width="100%" height="500px" class="rounded-xl border border-slate-200 bg-white mb-2"></iframe>
                <div class="text-right"><a href="${link}" target="_blank" class="text-xs font-bold text-blue-600 hover:underline"><i class="fa-solid fa-external-link-alt"></i> Ouvrir dans un nouvel onglet</a></div>`;
    };

    Swal.fire({
        title: `<div class="text-left"><span class="text-xs text-slate-400 uppercase">Candidature</span><div class="text-2xl font-black text-slate-800">${nom}</div><div class="text-sm text-blue-600 font-bold uppercase">${poste}</div></div>`,
        html: `
            <div class="mt-4">
                <div class="flex p-1 bg-slate-100 rounded-xl mb-4 gap-1">
                    <button onclick="switchTab('cv')" id="tab-cv" class="doc-tab flex-1 py-2 text-[10px] font-black uppercase rounded-lg bg-white shadow-sm text-slate-800 transition-all">CV</button>
                    <button onclick="switchTab('lm')" id="tab-lm" class="doc-tab flex-1 py-2 text-[10px] font-black uppercase rounded-lg text-slate-500 hover:bg-white/50 transition-all">Lettre</button>
                    <button onclick="switchTab('dip')" id="tab-dip" class="doc-tab flex-1 py-2 text-[10px] font-black uppercase rounded-lg text-slate-500 hover:bg-white/50 transition-all">Diplômes</button>
                    <button onclick="switchTab('att')" id="tab-att" class="doc-tab flex-1 py-2 text-[10px] font-black uppercase rounded-lg text-slate-500 hover:bg-white/50 transition-all">Attest.</button>
                </div>
                <div id="content-cv" class="doc-content block">${getViewer(docs.cv)}</div>
                <div id="content-lm" class="doc-content hidden">${getViewer(docs.lm)}</div>
                <div id="content-dip" class="doc-content hidden">${getViewer(docs.dip)}</div>
                <div id="content-att" class="doc-content hidden">${getViewer(docs.att)}</div>
            </div>
        `,
        width: 900,
        showConfirmButton: true,
        confirmButtonText: 'Fermer',
        confirmButtonColor: '#0f172a',
        didOpen: () => {
            // Logique locale pour les onglets
            window.switchTab = (t) => {
                document.querySelectorAll('.doc-tab').forEach(b => { b.classList.remove('bg-white', 'shadow-sm', 'text-slate-800'); b.classList.add('text-slate-500'); });
                document.querySelectorAll('.doc-content').forEach(c => c.classList.add('hidden'));
                document.getElementById(`tab-${t}`).classList.add('bg-white', 'shadow-sm', 'text-slate-800');
                document.getElementById(`tab-${t}`).classList.remove('text-slate-500');
                document.getElementById(`content-${t}`).classList.remove('hidden');
            };
        }
    });
}




function convertToInputDate(dStr){
    if(!dStr) return ""; 
    // Si c'est déjà au format YYYY-MM-DD
    if(dStr.match(/^\d{4}-\d{2}-\d{2}$/)) return dStr; 
    // Si c'est au format DD/MM/YYYY
    if(dStr.includes('/')){
        const p=dStr.split('/'); 
        return `${p[2]}-${p[1].padStart(2,'0')}-${p[0].padStart(2,'0')}`;
    } 
    return "";
}

// --- GESTION DES ACTIONS ---
async function handleCandidateAction(id, action) {
    const conf = {
        'VALIDER_POUR_ENTRETIEN': { t: 'Inviter en entretien ?', c: '#2563eb', txt: "Un email d'invitation sera envoyé." },
        'REFUS_IMMEDIAT': { t: 'Refuser la candidature ?', c: '#ef4444', txt: "Un email de refus standard sera envoyé." },
        'ACCEPTER_EMBAUCHE': { t: 'Confirmer l\'embauche ?', c: '#10b981', txt: 'Cela créera automatiquement le profil employé et enverra les accès.' },
        'REFUS_APRES_ENTRETIEN': { t: 'Refuser après entretien ?', c: '#f97316', txt: "Un email personnalisé (plus doux) sera envoyé." }
    }[action];

    const res = await Swal.fire({ 
        title: conf.t, 
        text: conf.txt, 
        icon: 'question', 
        showCancelButton: true, 
        confirmButtonColor: conf.c, 
        confirmButtonText: 'Oui, confirmer' 
    });
    
    if (res.isConfirmed) {
        Swal.fire({ title: 'En cours...', didOpen: () => Swal.showLoading() });
        try {
            await secureFetch(URL_CANDIDATE_ACTION, {
                method: 'POST', 
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ id: id, action: action, agent: currentUser.nom })
            });
            Swal.fire('Succès', 'Action effectuée', 'success');
            fetchCandidates();
            // Si on embauche, on recharge aussi la liste des employés
            if(action === 'ACCEPTER_EMBAUCHE') refreshAllData();
        } catch(e) { 
            Swal.fire('Erreur', e.message, 'error'); 
        }
    }
}   




                                                    function changePage(direction) {
            const totalPages = Math.ceil(employees.length / ITEMS_PER_PAGE);
            const newPage = currentPage + direction;
            
            if (newPage >= 1 && newPage <= totalPages) {
                currentPage = newPage;
                renderData();
                
                // --- CORRECTION DU SCROLL ---
                // On remonte doucement vers le haut du tableau, pas tout en haut de la page
                // Cela garde le focus visuel sur les données
                const tableSection = document.getElementById('view-employees');
                if(tableSection) {
                    tableSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        }











        // --- SÉCURITÉ XSS (NETTOYAGE DES DONNÉES) ---
        function escapeHTML(str) {
            if (str === null || str === undefined) return '';
            return String(str).replace(/[&<>'"]/g, 
                tag => ({
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    "'": '&#39;',
                    '"': '&quot;'
                }[tag]));
        }



    
    




// --- FEEDBACK FICHIER ---
function updateFileFeedback(inputId, labelId) {
    const input = document.getElementById(inputId);
    const label = document.getElementById(labelId); // Le bouton ou le conteneur visuel
    const file = input.files[0];

    if (file) {
        // Change le style pour dire "C'est bon !"
        if (label) {
            // Sauvegarde le texte original si pas déjà fait
            if (!label.dataset.originalText) label.dataset.originalText = label.innerHTML;
            
            // Affiche le nom et une icône verte
            label.innerHTML = `<i class="fa-solid fa-check-circle text-emerald-500 mr-2"></i> <span class="text-emerald-700 font-bold text-[10px] truncate">${file.name}</span>`;
            label.classList.add('bg-emerald-50', 'border-emerald-200');
            label.classList.remove('bg-white', 'bg-blue-50', 'text-slate-600', 'text-blue-600');
        }
    }
}











        // --- GESTION INTELLIGENTE DU RÉSEAU ---
        window.addEventListener('online', () => { 
            // 1. On ferme les alertes SweetAlert s'il y en a (comme "Pas de connexion")
            Swal.close();
            
            // 2. On affiche un petit toast vert
            const Toast = Swal.mixin({toast: true, position: 'top-end', showConfirmButton: false, timer: 3000});
            Toast.fire({ icon: 'success', title: 'Connexion Rétablie', text: 'Vous êtes de nouveau en ligne.' }); 
            
            // 3. On enlève le mode visuel hors ligne
            document.body.classList.remove('offline-mode'); 
            
            // 4. Optionnel : On peut retenter de charger les données si on est connecté
            if(currentUser) refreshAllData();
        });

        window.addEventListener('offline', () => { 
            const Toast = Swal.mixin({toast: true, position: 'top-end', showConfirmButton: false, timer: 5000});
            Toast.fire({ icon: 'warning', title: 'Connexion Perdue', text: 'Mode hors ligne activé.' }); 
            document.body.classList.add('offline-mode'); 
        });






