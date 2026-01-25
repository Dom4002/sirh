  let docBlobs = {
            id_card: null,
            cv: null,
            diploma: null,
            attestation: null,
            leave_justif: null
        };



// ==========================================
// CONFIGURATION DE PERSONNALISATION (SAAS)
// ==========================================
const SIRH_CONFIG = {
    company: {
        name: "PROELITES",
        logo: "https://cdn-icons-png.flaticon.com/128/13383/13383354.png",
        supportEmail: "rh@entreprise.com"
    },
    theme: {
        primary: "#0f172a",   // Couleur Sidebar
        accent: "#2563eb",    // Couleur Boutons / Éléments actifs
        fontFamily: "'Plus Jakarta Sans', sans-serif", // Choix de police
        baseFontSize: "14px" // Taille de base (14px ou 16px recommandé)
    },

    // 3. PARAMÈTRES GPS MULTI-SIÈGES
    // Note : Cette liste pourra être remplie dynamiquement par Airtable plus tard
    gps: {
        enabled: true,         // Activer la vérification GPS ?
        strictMode: true,      // Bloquer le pointage si hors zone ?
        
        // Liste des sièges autorisés
        offices: [
            { 
                name: "Siège Principal", 
                lat: 6.36,   // Latitude
                lon: 2.40,   // Longitude
                radius: 10000  // Rayon autorisé en mètres
            },
            { 
                name: "Agence Nord", 
                lat: 6.4521, 
                lon: 2.3845, 
                radius: 50 
            },
            { 
                name: "Entrepôt Logistique", 
                lat: 6.3500, 
                lon: 2.5000, 
                radius: 200 
            }
        ]
    },

    // 4. MODULES ACTIFS
    features: {
        recruitment: true,
        payroll: true,
        auditLogs: true
    },

    // 5. SERVEUR (BASE API)
    apiBaseUrl: "https://mon-api-rh.onrender.com/api"
};

// --- GÉNÉRATION AUTOMATIQUE DES LIENS ---
// (On utilise SIRH_CONFIG.apiBaseUrl pour ne rien changer en bas)
const URL_LOGIN = `${SIRH_CONFIG.apiBaseUrl}/login`; 
const URL_READ = `${SIRH_CONFIG.apiBaseUrl}/read`; 
const URL_WRITE_POST = `${SIRH_CONFIG.apiBaseUrl}/write`; 
const URL_UPDATE = `${SIRH_CONFIG.apiBaseUrl}/update`; 
const URL_READ_LOGS = `${SIRH_CONFIG.apiBaseUrl}/read-logs`; 
const URL_GATEKEEPER = `${SIRH_CONFIG.apiBaseUrl}/gatekeeper`; 
const URL_BADGE_GEN = `${SIRH_CONFIG.apiBaseUrl}/badge`; 
const URL_EMPLOYEE_UPDATE = `${SIRH_CONFIG.apiBaseUrl}/emp-update`; 
const URL_CONTRACT_GENERATE = `${SIRH_CONFIG.apiBaseUrl}/contract-gen`;
const URL_UPLOAD_SIGNED_CONTRACT = `${SIRH_CONFIG.apiBaseUrl}/contract-upload`;
const URL_LEAVE_REQUEST = `${SIRH_CONFIG.apiBaseUrl}/leave`;  
const URL_CLOCK_ACTION = `${SIRH_CONFIG.apiBaseUrl}/clock`;
const URL_READ_LEAVES = `${SIRH_CONFIG.apiBaseUrl}/read-leaves`;
const URL_LEAVE_ACTION = `${SIRH_CONFIG.apiBaseUrl}/leave-action`;
const URL_READ_CANDIDATES = `${SIRH_CONFIG.apiBaseUrl}/read-candidates`; 
const URL_CANDIDATE_ACTION = `${SIRH_CONFIG.apiBaseUrl}/candidate-action`;
const URL_READ_PAYROLL = `${SIRH_CONFIG.apiBaseUrl}/read-payroll`;
const URL_READ_FLASH = `${SIRH_CONFIG.apiBaseUrl}/read-flash`;
const URL_WRITE_FLASH = `${SIRH_CONFIG.apiBaseUrl}/write-flash`;

        const SCAN_KEY = "SIGD_SECURE_2025"; 
        const URL_REDIRECT_FAILURE = "https://google.com";

        // SON DE NOTIFICATION (Bip professionnel)
        const NOTIF_SOUND = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
        let currentView = 'dash'; 
        let allLeaves = []; // Pour stocker tous les congés et les comparer
        let myPayrolls = [];
        let currentFilter = 'all';
 
        // ÉTAPE 1 : Mémoire des derniers chargements (pour économiser les crédits Make)
        let lastFetchTimes = {
            global: 0,      // Pour la config GPS
            employees: 0,   // Pour la liste de base
            leaves: 0,      // Pour les congés
            candidates: 0,  // Pour le recrutement
            payroll: 0,     // Pour la paie
            flash: 0        // Pour les annonces
        };

        // On définit un délai de "fraîcheur" de 5 minutes (300 000 millisecondes)
        // L'app ne demandera pas de mise à jour au serveur avant ce délai, sauf si on l'y force.
        const REFRESH_THRESHOLD = 300000;




        // Variable globale qui stockera les infos du bureau
        let companyConfig = {
            latitude: null,      
            longitude: null,     
            radius: 100,         // Rayon par défaut (mètres)
            geo_required: false  // Force le GPS ou non
        };

        let currentUser = null, employees = [], videoStream = null, capturedBlob = null, contractBlob = null, contractStream = null;
                           
        
        let offsetSuivant = null; // Mémorise le marque-page pour le lot suivant
        let currentPage = 1;
        const ITEMS_PER_PAGE = 10; // Nombre d'employés par page







 // --- AUTO-RECONNEXION AVEC LOADER ---
        window.addEventListener('DOMContentLoaded', () => {
            applyBranding(); 
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
    // 1. Sécurité : Vérifier que la liste n'est pas vide
    if (!employees || employees.length === 0) {
        return Swal.fire('Patientez', 'Le système charge vos données...', 'info');
    }

    // 2. LOGIQUE DE RECHERCHE IDENTIQUE À loadMyProfile (qui fonctionne chez toi)
    const cleanUser = currentUser.nom.toLowerCase().replace(/[\.-_]/g, ' ').trim();

    let myData = employees.find(e => {
        const cleanEmp = e.nom.toLowerCase().replace(/[\.-_]/g, ' ').trim();
        return cleanEmp.includes(cleanUser) || cleanUser.includes(cleanEmp);
    });

    // 3. Fallback par ID au cas où
    if (!myData && currentUser.id) {
        myData = employees.find(e => String(e.id) === String(currentUser.id));
    }

    // 4. Si on ne trouve toujours rien
    if (!myData) {
        console.error("Badge Error: Impossible de trouver cet l'employé", currentUser.nom);
        return Swal.fire('Erreur', 'Impossible de localiser votre fiche employé pour générer le badge.', 'error');
    }

    // 5. Lancement de la génération
    const token = localStorage.getItem('sirh_token');
    Swal.fire({ 
        title: 'Génération du badge...', 
        text: 'Veuillez patienter',
        didOpen: () => Swal.showLoading(),
        allowOutsideClick: false 
    });

    try {
        // On formate la photo pour qu'elle soit visible sur le badge
        const photoUrl = myData.photo ? formatGoogleLink(myData.photo) : '';

        // Construction de l'URL vers ton API de badge
        const url = `${URL_BADGE_GEN}?id=${encodeURIComponent(myData.id)}&nom=${encodeURIComponent(myData.nom)}&poste=${encodeURIComponent(myData.poste)}&photo=${encodeURIComponent(photoUrl)}&agent=${encodeURIComponent(currentUser.nom)}&token=${token}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error("Erreur serveur");

        const htmlContent = await response.text();
        Swal.close();

        // Ouverture de la fenêtre d'impression
        const w = window.open('', '_blank', 'width=450,height=700');
        if (w) {
            w.document.open();
            w.document.write(htmlContent);
            w.document.close();
        } else {
            Swal.fire('Pop-up bloqué', 'Veuillez autoriser les fenêtres surgissantes pour voir votre badge.', 'warning');
        }

    } catch (error) {
        console.error(error);
        Swal.fire('Erreur', 'Une erreur technique est survenue.', 'error');
    }
}











async function requestNotificationPermission() {
    if (!("Notification" in window)) {
        console.log("Ce navigateur ne supporte pas les notifications.");
        return;
    }

    if (Notification.permission !== "granted") {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
            console.log("Permission notifications accordée !");
        }
    }
}








 




  async function secureFetch(url, options = {}) {
    // 0. SÉCURITÉ RÉSEAU IMMÉDIATE
    if (!navigator.onLine) {
        throw new Error("Vous êtes hors ligne. Vérifiez votre connexion internet.");
    }

    const token = localStorage.getItem('sirh_token');
    const headers = options.headers || {};
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // 1. TIMEOUT 60 SECONDES
    const TIMEOUT_MS = 60000; 
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS); 

    try {
        // 2. APPEL RÉSEAU
        const response = await fetch(url, { 
            ...options, 
            headers, 
            signal: controller.signal 
        });

        clearTimeout(timeoutId); 

        // 3. GESTION DES ERREURS HTTP
        if (!response.ok) {
            let errorMessage = `Erreur serveur (${response.status})`;
            try {
                const errData = await response.json();
                if (errData.error) errorMessage = errData.error;
            } catch (e) { }

            if (response.status === 401 || response.status === 403) {
                throw new Error("Session expirée. Veuillez vous reconnecter.");
            }
            throw new Error(errorMessage);
        }

        return response;

    } catch (error) {
        // 4. GESTION DES ERREURS TECHNIQUES
        if (error.name === 'AbortError') {
            throw new Error("Le serveur met trop de temps à répondre (> 60s). Réessayez.");
        }
        if (error.message.includes('Failed to fetch')) {
            throw new Error("Erreur de connexion. Vérifiez votre accès internet.");
        }
        throw error; 
    }
}
















async function handleLogin(e) { 
            e.preventDefault(); 
            // Déverrouille l'audio pour mobile
            NOTIF_SOUND.play().then(() => { NOTIF_SOUND.pause(); NOTIF_SOUND.currentTime = 0; }).catch(() => {});
            
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
            applyBranding();
            document.getElementById('login-screen').classList.add('hidden'); 
            document.getElementById('app-layout').classList.remove('hidden'); 
            document.getElementById('name-display').innerText = n; 
            document.getElementById('role-display').innerText = r; 
            document.getElementById('avatar-display').innerText = n[0]; 
            document.body.className = "text-slate-900 overflow-hidden h-screen w-screen role-" + r.toLowerCase(); 
            
            // Gestion de la vue par défaut
            if(r === 'EMPLOYEE') { 
                document.getElementById('nav-admin-section').style.display='none';
                document.getElementById('global-search-container').style.display='none';
                switchView('my-profile'); 
            } else { 
                switchView('dash'); 
            }

            // AFFICHAGE DES SKELETONS (Chargement visuel)
            const skeletonRow = `<tr class="border-b"><td class="p-4 flex gap-3 items-center"><div class="w-10 h-10 rounded-full skeleton"></div><div class="space-y-2"><div class="h-3 w-24 rounded skeleton"></div><div class="h-2 w-16 rounded skeleton"></div></div></td><td class="p-4"><div class="h-3 w-32 rounded skeleton"></div></td><td class="p-4"><div class="h-6 w-16 rounded-lg skeleton"></div></td><td class="p-4"></td></tr>`;
            document.getElementById('full-body').innerHTML = Array(6).fill(skeletonRow).join('');
            
            // --- LANCEMENT DE LA SYNCHRO GLOBALE ---
            // Au lieu de fetchData(false), on lance tout pour être sûr d'avoir Congés, Candidats, etc.
            refreshAllData();
            requestNotificationPermission();
            initDarkMode();
        }




                async function fetchCompanyConfig() {
                    try {
                        // On demande la config spécifique à l'agent connecté
                        const response = await secureFetch(`${URL_GET_CONFIG}?agent=${encodeURIComponent(currentUser.nom)}`);
                        const data = await response.json();

                        // On s'attend à recevoir : { "lat": 6.36, "lon": 2.40, "radius": 50, "active": true }
                        if (data.lat && data.lon) {
                            companyConfig.latitude = parseFloat(data.lat);
                            companyConfig.longitude = parseFloat(data.lon);
                            companyConfig.radius = parseInt(data.radius) || 100;
                            companyConfig.geo_required = (data.active === true || data.active === "true");
                            
                            console.log("📍 Bureau localisé (SaaS) :", companyConfig);
                        }
                    } catch (e) {
                        console.warn("⚠️ Impossible de charger la config GPS (Mode par défaut)", e);
                    }
                }







 async function refreshAllData(force = false) {
    const now = Date.now();
    const icon = document.getElementById('refresh-icon'); 
    if(icon) icon.classList.add('fa-spin');

    // On n'affiche le message de synchronisation que si c'est une action forcée
    const Toast = Swal.mixin({toast: true, position: 'top-end', showConfirmButton: false});
    if(force) Toast.fire({icon: 'info', title: 'Actualisation intelligente...'});

    try {
        const tasks = [];

        // --- 1. FONCTIONS GLOBALES (Légères) ---
        // GPS (seulement si nécessaire)
        if (force || (now - lastFetchTimes.global > 3600000)) {
            tasks.push(fetchCompanyConfig().then(() => lastFetchTimes.global = now).catch(e => console.warn("GPS ignoré", e)));
        }
        // Flash Info (Utile partout pour les alertes)
        tasks.push(fetchFlashMessage().then(() => lastFetchTimes.flash = now).catch(e => console.warn("Flash ignoré", e)));


        // --- 2. ACTUALISATION CIBLÉE SELON LA VUE ---
        
        if (currentView === 'dash') {
            // DASHBOARD : Besoin des Employés (pour les stats) et des Congés (pour les graphiques)
            // On recharge les employés seulement si > 5 min ou forcé
            if (force || (now - lastFetchTimes.employees > REFRESH_THRESHOLD)) {
                await fetchData(force); 
                lastFetchTimes.employees = now;
            }
            // On recharge les congés si manager
            if (currentUser.role !== 'EMPLOYEE') {
                tasks.push(fetchLeaveRequests().then(() => lastFetchTimes.leaves = now));
            }
        } 
        else if (currentView === 'employees' || currentView === 'add-new') {
            // VUE EMPLOYÉS : On force la mise à jour de la liste employés
            await fetchData(true);
            lastFetchTimes.employees = now;
        }
        else if (currentView === 'recruitment') {
            // VUE RECRUTEMENT : Uniquement les candidats (Gros gain de crédits !)
            tasks.push(fetchCandidates().then(() => lastFetchTimes.candidates = now));
        }
        else if (currentView === 'logs') {
            // VUE LOGS : Uniquement les logs
            tasks.push(fetchLogs());
        }
        else if (currentView === 'my-profile') {
            // VUE PROFIL : Mes infos et ma paie
            loadMyProfile(); 
            tasks.push(fetchPayrollData().then(() => lastFetchTimes.payroll = now));
        }

        // Exécution des tâches ciblées
        await Promise.all(tasks);

        // Mise à jour des graphiques uniquement si on est sur le dashboard (pour éviter les erreurs)
        if (currentView === 'dash') {
            renderCharts();
        }

        if(force) Toast.fire({icon: 'success', title: 'Données à jour !', timer: 2000});

    } catch (error) {
        console.error("Erreur Sync:", error);
    } finally {
        if(icon) setTimeout(() => icon.classList.remove('fa-spin'), 500);
    }
}













 async function triggerGlobalPush(title, message) {
    // 1. SON (Ordi et Mobile déverrouillé)
    NOTIF_SOUND.play().catch(e => console.log("Audio en attente d'interaction"));

    // 2. VIBRATION (Android uniquement, iOS ne l'autorise pas en JS web)
    if ("vibrate" in navigator) {
        navigator.vibrate([200, 100, 200]);
    }

    // 3. NOTIFICATION (Méthode PWA Mobile)
    if (Notification.permission === "granted") {
        // On vérifie si on est dans la PWA (Service Worker)
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            const reg = await navigator.serviceWorker.ready;
            reg.showNotification(title, {
                body: message,
                icon: 'https://cdn-icons-png.flaticon.com/512/9322/9322127.png',
                badge: 'https://cdn-icons-png.flaticon.com/512/9322/9322127.png',
                vibrate: [200, 100, 200],
                tag: 'flash-info', // Évite de cumuler 50 notifications
                renotify: true
            });
        } else {
            // Fallback pour ordinateur
            new Notification(title, { body: message });
        }
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
                    renderData(); loadMyProfile(); renderCharts();
                    return; 
                }
            }

            try{ 
                let fetchUrl = `${URL_READ}?agent=${encodeURIComponent(currentUser.nom)}`;
                const r = await secureFetch(fetchUrl); 
                const d = await r.json(); 
                
                employees = d.map(x => {
                    const getRawLink = (l) => {
                         if (!l) return '';
                         if (Array.isArray(l) && l.length > 0) return l[0].url || l[0];
                         if (typeof l === 'object' && l.url) return l.url;
                         return String(l);
                    };

                    return { 
                        id: x.employee_id || x.id, 
                        nom: x.nom || x.Nom, 
                        date: x.date_embauche || x.date, 
                        poste: x.poste || x.Poste, 
                        dept: x['département'] || x.departement || "Non défini", 
                        limit: x.type_contrat || 365, 
                        photo: x.photo || x.Photo || '', 
                        statut: x.Statut || 'Actif', 
                        email: x.email, 
                        telephone: x.telephone || x['téléphone'], 
                        adresse: x.adresse, 
                        date_naissance: x.date_naissance, 
                        role: x.role || x.Role || 'EMPLOYEE',
                        doc: getRawLink(x.contrat_pdf || x.doc),
                        contract_status: x.contract_status || 'Non signé',
                        cv_link: getRawLink(x.cv_link),
                        id_card_link: getRawLink(x.id_card_link),
                        diploma_link: getRawLink(x.diploma_link),
                        attestation_link: getRawLink(x.attestation_link || x.attestation),
                        lm_link: getRawLink(x.lm_link)
                    };
                });

                localStorage.setItem(CACHE_KEY, JSON.stringify(employees));
                localStorage.setItem(CACHE_KEY + '_time', Date.now());
                
                renderData(); loadMyProfile(); renderCharts(); fetchLeaveRequests(); 

            } catch(e){ 
                console.error("Erreur Fetch:", e); 
                let diagnostic = "Erreur Système";
                if (!navigator.onLine) diagnostic = "Connexion Internet coupée";
                else if (e.message.includes("403") || e.message.includes("429")) diagnostic = "Quota Make.com épuisé (Crédits)";
                else if (e.message.includes("500")) diagnostic = "Service indisponible (Erreur Serveur)";

                const cached = localStorage.getItem(CACHE_KEY);
                if(cached) {
                    employees = JSON.parse(cached);
                    renderData(); loadMyProfile(); renderCharts();
                    const Toast = Swal.mixin({toast: true, position: 'bottom-end', showConfirmButton: false, timer: 5000});
                    Toast.fire({ icon: 'warning', title: diagnostic, text: 'Données locales affichées.' });
                } else { 
                    Swal.fire('Erreur Critique', diagnostic, 'error'); 
                }
            } 
        }



         











function renderData() { 
    const b = document.getElementById('full-body'); 
    const d = document.getElementById('dashboard-body'); 
    b.innerHTML = ''; 
    d.innerHTML = ''; 
    
    let total = 0, alertes = 0, actifs = 0; 

    // --- 1. CALCUL DES STATS (Sur TOUT l'effectif) ---
    employees.forEach(e => { 
        total++; 
        const rawStatus = (e.statut || 'Actif').toLowerCase().trim();
        const isSortie = rawStatus.includes('sortie'); 
        
        if (rawStatus === 'actif') actifs++; 
        
        let dL = 999, isU = false, isExpired = false;
        
        if(e.date && !isSortie) { 
            let sD = parseDateSmart(e.date); 
            let eD = new Date(sD); 
            eD.setDate(eD.getDate() + (parseInt(e.limit) || 365));
            dL = Math.ceil((eD - new Date()) / 86400000); 

            if (dL < 0) { isExpired = true; alertes++; } 
            else if (dL <= 15) { isU = true; alertes++; }

            if(isExpired || isU) {
                d.innerHTML += `<tr class="bg-white border-b"><td class="p-4 text-sm font-bold text-slate-700">${escapeHTML(e.nom)}</td><td class="p-4 text-xs text-slate-500">${escapeHTML(e.poste)}</td><td class="p-4 ${isExpired ? 'text-red-600' : 'text-orange-600'} font-bold text-xs uppercase">${isExpired ? 'Expiré' : dL + ' jours'}</td><td class="p-4 rh-only text-right"><button class="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold" onclick="openEditModal('${escapeHTML(e.id)}')">GÉRER</button></td></tr>`; 
            }
        }
    }); 

    // --- 2. FILTRAGE POUR L'AFFICHAGE ---
    let filteredEmployees = employees;
    
    if (typeof currentFilter !== 'undefined' && currentFilter !== 'all') {
        filteredEmployees = employees.filter(e => {
            const safeStatut = (e.statut || "").toLowerCase();
            const safeDept = (e.dept || "").toLowerCase();
            const search = currentFilter.toLowerCase();
            
            // Logique de correspondance (exacte ou partielle)
            return safeStatut.includes(search) || safeDept.includes(search);
        });
    }

    // --- 3. PAGINATION SUR LA LISTE FILTRÉE ---
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedEmployees = filteredEmployees.slice(startIndex, endIndex);

    paginatedEmployees.forEach(e => {
        const rawStatus = (e.statut || 'Actif').toLowerCase().trim();
        let dL = 999, isU = false, isExpired = false;
        const isSortie = rawStatus.includes('sortie');
        const isConges = rawStatus.includes('cong');
        
        if(e.date && !isSortie) {
            let sD = parseDateSmart(e.date); 
            let eD = new Date(sD); 
            eD.setDate(eD.getDate() + (parseInt(e.limit) || 365));
            dL = Math.ceil((eD - new Date()) / 86400000); 
            if (dL < 0) isExpired = true;
            else if (dL <= 15) isU = true;
        }

        let bdgClass = "bg-green-100 text-green-700";
        let bdgLabel = e.statut || 'Actif';

        if(isSortie) { 
            bdgClass = "bg-slate-100 text-slate-500"; 
            bdgLabel = "SORTIE"; 
        } else if(isExpired) { 
            bdgClass = "bg-red-100 text-red-700 font-bold border border-red-200"; 
            bdgLabel = `EXPIRÉ`; 
        } else if(isU) { 
            bdgClass = "bg-orange-100 text-orange-700 animate-pulse font-bold"; 
            bdgLabel = `FIN: ${dL}j`; 
        } else if(isConges) { 
            bdgClass = "bg-blue-100 text-blue-700"; 
            bdgLabel = "CONGÉ"; 
        }

        const av = e.photo && e.photo.length > 10 ? `<img src="${formatGoogleLink(e.photo)}" loading="lazy" decoding="async" class="w-10 h-10 rounded-full object-cover bg-slate-200 border border-slate-200">` : `<div class="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200 rounded-full flex items-center justify-center text-xs font-black text-slate-500">${escapeHTML(e.nom).substring(0,2).toUpperCase()}</div>`;
        
        const sStr = String(e.contract_status || '').toLowerCase().trim(); 
        const isSigned = (sStr === 'signé' || sStr === 'signe');
        
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
        
        b.innerHTML+=`<tr class="border-b hover:bg-slate-50 transition-colors"><td class="p-4 flex gap-3 items-center min-w-[200px]">${av}<div><div class="font-bold text-sm text-slate-800 uppercase">${escapeHTML(e.nom)}</div><div class="text-[10px] text-slate-400 font-mono tracking-tighter">${safeId}</div></div></td><td class="p-4 text-xs font-medium text-slate-500">${escapeHTML(e.poste)}</td><td class="p-4"><span class="px-3 py-1 border rounded-lg text-[10px] font-black uppercase ${bdgClass}">${escapeHTML(bdgLabel)}</span></td><td class="p-4 rh-only">${contractActions}</td></tr>`; 
    });

    // Mises à jour UI
    document.getElementById('stat-total').innerText = total; 
    document.getElementById('stat-alert').innerText = alertes; 
    document.getElementById('stat-active').innerText = actifs;

    // Mise à jour pagination avec la liste FILTRÉE
    const totalPages = Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE);
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
                    
                    let locationCoords = "Non détecté";
                    let dist = 0;
                    let userIp = "Inconnue";
                    let deviceType = navigator.userAgentData ? navigator.userAgentData.platform : navigator.platform;

                    // 1. Feedback visuel immédiat
                    Swal.fire({ 
                        title: 'Sécurisation du pointage...', 
                        text: 'Vérification GPS, IP et Appareil...', 
                        didOpen: () => Swal.showLoading(), 
                        allowOutsideClick: false 
                    });

                    try {
                        // 2. RÉCUPÉRATION IP & INFOS SIMULTANÉES
                        const ipPromise = fetch('https://api.ipify.org?format=json').then(r => r.json()).catch(() => ({ip: "Erreur IP"}));
                        
                        // 3. RÉCUPÉRATION POSITION GPS
                        const posPromise = new Promise((resolve, reject) => {
                            navigator.geolocation.getCurrentPosition(resolve, reject, {
                                enableHighAccuracy: true, timeout: 15000, maximumAge: 0
                            });
                        });

                        const [ipData, pos] = await Promise.all([ipPromise, posPromise]);
                        
                        userIp = ipData.ip;
                        const userLat = pos.coords.latitude;
                        const userLon = pos.coords.longitude;
                        locationCoords = `${userLat},${userLon}`;

                        // 4. VÉRIFICATION MULTI-SIÈGES (Basée sur SIRH_CONFIG)
                        let isInsideAnyOffice = false;
                        let nearestOfficeName = "";
                        let minDistanceFound = Infinity;

                        if (SIRH_CONFIG.gps.enabled) {
                            SIRH_CONFIG.gps.offices.forEach(office => {
                                const d = getDistance(userLat, userLon, office.lat, office.lon);
                                if (d <= office.radius) {
                                    isInsideAnyOffice = true;
                                    dist = d;
                                    nearestOfficeName = office.name;
                                }
                                if (d < minDistanceFound) {
                                    minDistanceFound = d;
                                    if(!isInsideAnyOffice) nearestOfficeName = office.name;
                                }
                            });

                            if (SIRH_CONFIG.gps.strictMode && !isInsideAnyOffice) {
                                Swal.fire({
                                    icon: 'error',
                                    title: 'Zone non autorisée',
                                    html: `Vous êtes à <b>${Math.round(minDistanceFound)}m</b> de <b>${nearestOfficeName}</b>.<br>Pointage impossible ici.`,
                                    confirmButtonColor: '#ef4444'
                                });
                                return; 
                            }
                            dist = isInsideAnyOffice ? Math.round(dist) : Math.round(minDistanceFound);
                        }

                    } catch(e) { 
                        console.warn("Erreur identification:", e.message);
                        if (SIRH_CONFIG.gps.enabled && SIRH_CONFIG.gps.strictMode) {
                            return Swal.fire('Sécurité GPS', 'Activez votre localisation pour pointer.', 'warning');
                        }
                    }

                    // 5. Préparation des données (Payload enrichi)
                    const payload = {
                        id: currentUser.id, 
                        nom: currentUser.nom, 
                        action: action, 
                        time: new Date().toISOString(), 
                        gps: locationCoords, 
                        distance_bureau: dist,
                        ip: userIp,
                        device: navigator.userAgent, // Envoie le détail complet au serveur
                        agent: currentUser.nom
                    };

                    // 6. Gestion Hors-Ligne
                    if (!navigator.onLine) {
                        const queue = JSON.parse(localStorage.getItem('sirh_offline_queue') || '[]');
                        queue.push(payload);
                        localStorage.setItem('sirh_offline_queue', JSON.stringify(queue));
                        const newStatus = action === 'CLOCK_IN' ? 'IN' : 'OUT';
                        localStorage.setItem('clock_status_' + currentUser.id, newStatus);
                        updateClockUI(newStatus === 'IN');
                        Swal.fire({ icon: 'info', title: 'Mode Hors-Ligne', text: 'Pointage sécurisé en local.' });
                        return;
                    }

                    // 7. Envoi au Serveur
                    try {
                        const response = await secureFetch(URL_CLOCK_ACTION, { 
                            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) 
                        });
                        
                        if (response.ok) {
                            const newStatus = action === 'CLOCK_IN' ? 'IN' : 'OUT';
                            localStorage.setItem('clock_status_' + currentUser.id, newStatus);
                            updateClockUI(newStatus === 'IN');
                            
                            Swal.fire({ 
                                icon: 'success', 
                                title: action === 'CLOCK_IN' ? 'Bienvenue !' : 'Au revoir !', 
                                html: `<div class="text-xs text-slate-500 mt-2">Identifié via IP: ${userIp}<br>Appareil: ${deviceType}</div>`,
                                timer: 3000, showConfirmButton: false 
                            });
                        }
                    } catch (e) { 
                        Swal.fire('Echec', 'Erreur serveur : ' + e.message, 'error'); 
                    }
                }







function openFullFolder(id) {
    const e = employees.find(x => x.id === id); if(!e) return;
    
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

    const docs = [ 
        { label: 'Contrat Actuel', link: e.doc, icon: 'fa-file-signature', color: 'blue', key: 'contrat' }, 
        { label: 'Curriculum Vitae', link: e.cv_link, icon: 'fa-file-pdf', color: 'indigo', key: 'cv' }, 
        { label: 'Lettre Motivation', link: e.lm_link, icon: 'fa-envelope-open-text', color: 'pink', key: 'lm' },
        { label: 'Pièce d\'Identité', link: e.id_card_link, icon: 'fa-id-card', color: 'slate', key: 'id_card' }, 
        { label: 'Diplômes/Certifs', link: e.diploma_link, icon: 'fa-graduation-cap', color: 'emerald', key: 'diploma' },
        { label: 'Attestations / Autres', link: e.attestation_link, icon: 'fa-file-invoice', color: 'orange', key: 'attestation' } 
    ];

    docs.forEach(doc => { 
        const hasLink = doc.link && doc.link.length > 5; 
        // --- CORRECTION : Protection contre les guillemets simples dans le label ---
        const safeLabel = doc.label.replace(/'/g, "\\'");

        grid.innerHTML += `
            <div class="p-4 rounded-2xl border ${hasLink ? 'bg-white shadow-sm border-slate-200' : 'bg-slate-100 opacity-50'} flex items-center justify-between group">
                <div class="flex items-center gap-3">
                    <div class="p-2.5 rounded-xl bg-${doc.color}-50 text-${doc.color}-600"><i class="fa-solid ${doc.icon}"></i></div>
                    <p class="text-xs font-bold text-slate-700">${doc.label}</p>
                </div>
                <div class="flex gap-2">
                    ${hasLink ? `<button onclick="viewDocument('${doc.link}', '${safeLabel}')" class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Consulter"><i class="fa-solid fa-eye"></i></button>` : ''}
                    
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
    // 1. Sécurité : Si la liste est vide, on arrête
    if (!employees || employees.length === 0) {
        console.warn("Liste employés vide, impossible de charger le profil.");
        return;
    }

    // 2. Recherche Intelligente (Smart Matching)
    const cleanUser = currentUser.nom.toLowerCase().replace(/[\.-_]/g, ' ').trim();

    let myData = employees.find(e => {
        const cleanEmp = e.nom.toLowerCase().replace(/[\.-_]/g, ' ').trim();
        return cleanEmp.includes(cleanUser) || cleanUser.includes(cleanEmp);
    });

    // 3. Fallback : Si on ne trouve pas par nom, on cherche par ID si disponible
    if (!myData && currentUser.id) {
        myData = employees.find(e => e.id === currentUser.id);
    }

    // Si toujours rien trouvé
    if (!myData) {
        console.error("Profil introuvable pour :", currentUser.nom);
        return;
    }
    
    // --- Remplissage de l'interface ---
    document.getElementById('emp-name').innerText = myData.nom; 
    document.getElementById('emp-job').innerText = myData.poste;
    
    // --- Mise à jour du nom et de l'initiale en bas à gauche (Sidebar) ---
    const nameDisplay = document.getElementById('name-display');
    const avatarDisplay = document.getElementById('avatar-display');
    if (nameDisplay) nameDisplay.innerText = myData.nom;
    if (avatarDisplay) avatarDisplay.innerText = myData.nom.charAt(0).toUpperCase();
    
    // Gestion Photo
    const photoEl = document.getElementById('emp-photo-real');
    const avatarEl = document.getElementById('emp-avatar');
    
    if(myData.photo && myData.photo.length > 10) { 
        photoEl.src = formatGoogleLink(myData.photo); 
        photoEl.classList.remove('hidden'); 
        avatarEl.classList.add('hidden'); 
    } else {
        photoEl.classList.add('hidden'); 
        avatarEl.classList.remove('hidden');
        avatarEl.innerText = myData.nom.charAt(0).toUpperCase();
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
    
    // --- GESTION DES DOCUMENTS (MODE GRILLE + VOIR PLUS) ---
    const dC = document.getElementById('doc-container'); 
    dC.innerHTML = '';

    const allDocs = [ 
        { label: 'Contrat Actuel', link: myData.doc, icon: 'fa-file-signature', color: 'blue', key: 'contrat' }, 
        { label: 'Curriculum Vitae', link: myData.cv_link, icon: 'fa-file-pdf', color: 'indigo', key: 'cv' }, 
        { label: 'Lettre Motivation', link: myData.lm_link, icon: 'fa-envelope-open-text', color: 'pink', key: 'lm' },
        { label: 'Pièce d\'Identité', link: myData.id_card_link, icon: 'fa-id-card', color: 'slate', key: 'id_card' }, 
        { label: 'Diplômes/Certifs', link: myData.diploma_link, icon: 'fa-graduation-cap', color: 'emerald', key: 'diploma' },
        { label: 'Attestations', link: myData.attestation_link, icon: 'fa-file-invoice', color: 'orange', key: 'attestation' } 
    ];

    // CONFIGURATION GRILLE
    const VISIBLE_LIMIT = 4; // Nombre de documents visibles avant "Voir plus"
    let gridHtml = '<div class="grid grid-cols-1 md:grid-cols-4 gap-4">'; // 1 col sur mobile, 4 sur PC

    allDocs.forEach((doc, index) => {
        const hasLink = doc.link && doc.link.length > 5;
        const safeLabel = doc.label.replace(/'/g, "\\'");
        
        // Cache les éléments qui dépassent la limite
        const hiddenClass = index >= VISIBLE_LIMIT ? 'hidden more-docs' : '';

        gridHtml += `
            <div class="${hiddenClass} flex flex-col justify-between p-4 border border-slate-100 bg-white rounded-2xl hover:shadow-md transition-all group h-full">
                
                <div class="flex items-center gap-3 mb-4">
                    <div class="bg-${doc.color}-50 text-${doc.color}-600 p-3 rounded-xl shrink-0">
                        <i class="fa-solid ${doc.icon} text-lg"></i>
                    </div>
                    <div class="overflow-hidden">
                        <p class="text-xs font-bold text-slate-700 truncate" title="${doc.label}">${doc.label}</p>
                        <p class="text-[9px] text-slate-400 font-bold uppercase tracking-wide">Document</p>
                    </div>
                </div>

                <div class="flex gap-2 mt-auto">
                    ${hasLink ? `
                    <button onclick="viewDocument('${doc.link}', '${safeLabel}')" class="flex-1 py-2 text-[10px] font-bold uppercase bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all">
                        <i class="fa-solid fa-eye mr-1"></i> Voir
                    </button>` : `
                    <div class="flex-1 py-2 text-[10px] font-bold uppercase bg-slate-50 text-slate-300 rounded-lg text-center cursor-not-allowed">
                        Vide
                    </div>`}
                    
                    ${doc.key === 'id_card' ? `
                    <button onclick="updateSingleDoc('${doc.key}', '${myData.id}')" class="w-10 flex items-center justify-center bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-800 hover:text-white transition-all" title="Mettre à jour">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    ` : ''}
                </div>
            </div>`;
    });

    gridHtml += '</div>';

    // Ajout du bouton "Voir plus" si nécessaire
    if (allDocs.length > VISIBLE_LIMIT) {
        const countHidden = allDocs.length - VISIBLE_LIMIT;
        gridHtml += `
            <div class="text-center mt-4 pt-2 border-t border-slate-50">
                <button onclick="toggleMoreDocs(this)" class="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm">
                    <i class="fa-solid fa-circle-plus"></i> Voir ${countHidden} autre(s) document(s)
                </button>
            </div>
        `;
    }

    dC.innerHTML = gridHtml;
}













 function switchView(v) { 
    // --- MODIFICATION : On mémorise la vue active ---
    currentView = v;
    console.log("Vue active :", currentView);

    // 1. Arrêt des caméras (Nettoyage)
    if(videoStream) { videoStream.getTracks().forEach(t => t.stop()); videoStream = null; }
    if(contractStream) { contractStream.getTracks().forEach(t => t.stop()); contractStream = null; }
    
    // 2. Masquer TOUTES les sections
    document.querySelectorAll('.view-section').forEach(section => {
        section.classList.remove('active');
    });

    // 3. Afficher la section demandée
    const target = document.getElementById('view-' + v);
    if(target) target.classList.add('active');

    // 4. Gestion des boutons du menu (Style actif)
    document.querySelectorAll('.nav-btn').forEach(b => {
        b.classList.remove('bg-blue-600', 'text-white');
        // On remet le style par défaut
    });
    
    // On active le bouton cliqué (celui qui a switchView('v') dans son onclick)
    const activeBtn = document.querySelector(`button[onclick="switchView('${v}')"]`);
    if(activeBtn) activeBtn.classList.add('bg-blue-600', 'text-white');

    // --- CORRECTION MAJEURE ICI : RESET DU SCROLL ---
    // On force le conteneur principal à remonter tout en haut
    const mainContainer = document.getElementById('main-scroll-container');
    if(mainContainer) {
        mainContainer.scrollTo(0, 0); // Remonte instantanément
    }
    window.scrollTo(0, 0); // Sécurité pour le body aussi

    // 5. Logique spécifique par vue
    const searchContainer = document.getElementById('global-search-container');
    if(v === 'employees' || v === 'logs') { 
        if(currentUser && currentUser.role !== 'EMPLOYEE') { 
            searchContainer.style.visibility = 'visible'; 
            searchContainer.style.opacity = '1'; 
        }
    } else { 
        searchContainer.style.visibility = 'hidden'; 
        searchContainer.style.opacity = '0'; 
    }
    
if(v === 'add-new') { 
        document.getElementById('form-onboarding').reset(); 
        resetCamera(); 
    }
    
    // --- CORRECTION : Chargement automatique des données selon l'onglet ---
    if(v === 'logs') fetchLogs(); 
    if(v === 'recruitment') fetchCandidates();
    if(v === 'my-profile') {
        loadMyProfile(); 
        fetchPayrollData(); // C'EST CETTE LIGNE QUI MANQUAIT !
    }

    // 6. Fermer sidebar sur mobile
    if(window.innerWidth < 768) { 
        const sb = document.getElementById('sidebar'); 
        if(!sb.classList.contains('-translate-x-full')) toggleSidebar(); 
    }
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

                    fetchData(true); // On met à jour la liste des employés

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

    // --- CORRECTION : Recherche sécurisée du Matricule ---
    // On nettoie les noms (enlève points, espaces) pour comparer "sena.broda" et "Sena Broda"
    const normalize = (s) => s ? s.toLowerCase().replace(/[\.\s_-]/g, '') : '';
    const searchNom = normalize(currentUser.nom);

    const myData = employees.find(e => 
        normalize(e.nom) === searchNom || 
        normalize(e.nom).includes(searchNom) || 
        searchNom.includes(normalize(e.nom))
    );

    // Si on trouve l'employé dans la liste, on prend son Matricule (myData.id)
    // Sinon on garde l'ID de secours
    const idToSend = (myData && myData.id) ? myData.id : currentUser.id;
    
    // Log pour vérifier dans ta console (F12) avant l'envoi
    console.log("Tentative d'envoi pour l'ID :", idToSend);

    const fd = new FormData();
    fd.append('id', idToSend); // Envoie le Matricule au lieu du Record ID
    fd.append('email', document.getElementById('emp-email').value);
    fd.append('phone', document.getElementById('emp-phone').value);
    fd.append('address', document.getElementById('emp-address').value);
    fd.append('dob', document.getElementById('emp-dob').value);
    fd.append('agent', currentUser.nom);
    fd.append('doc_type', 'text_update'); 

    const pI = document.getElementById('emp-upload-photo');
    if (pI.files[0]) {
        fd.append('new_photo', pI.files[0]); 
    }

    try {
        const response = await secureFetch(URL_EMPLOYEE_UPDATE, { 
            method: 'POST', 
            body: fd 
        });
        
        if (response.ok) {
            Swal.fire('Succès', 'Votre profil a été mis à jour', 'success');
            toggleEditMode(); 
            fetchData(true); // On met à jour ses infos
        } else {
            throw new Error("Erreur serveur (" + response.status + ")");
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
                    
                    fetchData(true); // On force uniquement la mise à jour de la liste des employés

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



                                                                                    // Fonction pour ouvrir n'importe quel doc en mode lecture (PDF, IMG, Word...)
function viewDocument(url, title) {
    if (!url || url === '#' || url === 'null') {
        return Swal.fire('Oups', 'Aucun document disponible.', 'info');
    }

    // 1. On extrait l'ID Google Drive
    const str = String(url);
    const match = str.match(/\/d\/([a-zA-Z0-9_-]+)/) || str.match(/id=([a-zA-Z0-9_-]+)/);
    
    let finalUrl = url;

    // 2. Si c'est du Drive, on force le mode "PREVIEW" (Liseuse)
    if (match && match[1]) {
        finalUrl = `https://drive.google.com/file/d/${match[1]}/preview`;
    }

    // 3. On ouvre une belle modale
    Swal.fire({
        title: `<span class="text-sm font-bold uppercase text-slate-500">${title || 'Document'}</span>`,
        html: `
            <div class="rounded-xl overflow-hidden border border-slate-200 bg-slate-100" style="height: 75vh;">
                <iframe src="${finalUrl}" width="100%" height="100%" style="border:none;" allow="autoplay"></iframe>
            </div>
            <div class="mt-2 text-right">
                <a href="${url}" target="_blank" class="text-xs font-bold text-blue-600 hover:underline">
                    <i class="fa-solid fa-external-link-alt"></i> Ouvrir dans une nouvelle fenêtre
                </a>
            </div>
        `,
        width: '90%', // Largeur quasi plein écran
        showConfirmButton: true,
        confirmButtonText: 'Fermer',
        confirmButtonColor: '#0f172a',
        padding: '1rem'
    });
}



        
        function generateDraftContract(id) { 
            const e = employees.find(x => x.id === id); if(!e) return; 
            const token = localStorage.getItem('sirh_token');
            window.open(`${URL_CONTRACT_GENERATE}?id=${encodeURIComponent(id)}&nom=${encodeURIComponent(e.nom)}&poste=${encodeURIComponent(e.poste)}&date=${encodeURIComponent(e.date)}&agent=${encodeURIComponent(currentUser.nom)}&token=${token}`, '_blank'); 
        }
        

        









            function openContractModal(id) {
                document.getElementById('contract-id-hidden').value = id;
                document.getElementById('contract-modal').classList.remove('hidden');
                
                // Initialisation du pad de signature sur le canvas
                const canvas = document.getElementById('signature-pad');
                signaturePad = new SignaturePad(canvas, {
                    backgroundColor: 'rgba(255, 255, 255, 0)', // Fond transparent
                    penColor: 'rgb(0, 0, 0)' // Encre noire
                });

                // Cette partie est CRUCIALE pour que la signature soit précise sur mobile (Retina display)
                const ratio = Math.max(window.devicePixelRatio || 1, 1);
                canvas.width = canvas.offsetWidth * ratio;
                canvas.height = canvas.offsetHeight * ratio;
                canvas.getContext("2d").scale(ratio, ratio);
                signaturePad.clear(); // On vide le cadre au cas où
            }








       
       
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
        

        



async function submitFlashMessage(e) {
    e.preventDefault();
    
    const msgInput = document.getElementById('flash-input-msg');
    const typeInput = document.getElementById('flash-input-type');
    const durationInput = document.getElementById('flash-input-duration');

    if(!msgInput || !durationInput) return;

    const msg = msgInput.value;
    const type = typeInput ? typeInput.value : "Info";
    const durationMinutes = parseFloat(durationInput.value);
    
    const now = new Date();
    // CALCUL : Maintenant + (Minutes choisies * 60 000 ms)
    const expirationDate = new Date(now.getTime() + (durationMinutes * 60000));

    Swal.fire({ title: 'Publication...', didOpen: () => Swal.showLoading() });

    try {
        const response = await secureFetch(URL_WRITE_FLASH, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: msg,
                type: type,
                sender: currentUser.nom,
                date: now.toISOString(),
                date_expiration: expirationDate.toISOString(),
                agent: currentUser.nom
            })
        });

        if (response.ok) {
            document.getElementById('flash-modal').classList.add('hidden');
            const timeStr = expirationDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            Swal.fire('Succès !', `L'alerte est publiée. Elle expirera à ${timeStr}`, 'success');
            // On rafraîchit l'affichage pour voir le message immédiatement
            setTimeout(() => fetchFlashMessage(), 1000);
        }
    } catch (e) {
        console.error("Erreur envoi flash:", e);
        Swal.fire('Erreur', "Le serveur n'a pas reçu l'info. Vérifie ta connexion.", 'error');
    }
}










 async function submitSignedContract() { 
    // On vérifie si l'employé a dessiné quelque chose
    if (!signaturePad || signaturePad.isEmpty()) { 
        return Swal.fire('Attention', 'Veuillez apposer votre signature avant de valider.', 'warning'); 
    }

    const id = document.getElementById('contract-id-hidden').value; 
    
    // MAGIE : On transforme le dessin en texte Base64
    const signatureBase64 = signaturePad.toDataURL(); 

    Swal.fire({ 
        title: 'Signature en cours...', 
        text: 'Incrustation de votre signature dans le contrat PDF', 
        didOpen: () => Swal.showLoading(),
        allowOutsideClick: false
    }); 

    try { 
        // On envoie le texte de la signature à ton Webhook au lieu du fichier
        const r = await secureFetch(URL_UPLOAD_SIGNED_CONTRACT, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                id: id, 
                signature: signatureBase64, // C'est cette variable que Make utilisera
                agent: currentUser.nom 
            }) 
        }); 
        
        if (r.ok) { 
            Swal.fire('Succès', 'Le contrat a été signé numériquement et archivé avec succès.', 'success'); 
            closeContractModal(); 
            refreshAllData(); 
        } 
    } catch (e) { 
        console.error(e);
        Swal.fire('Erreur', "Échec technique lors de la signature : " + e.message, 'error'); 
    } 
}





function showLeaveDetail(encodedNom, encodedType, debut, fin, encodedMotif, encodedLink) {
    // 1. DÉCODAGE DES DONNÉES
    const nom = decodeURIComponent(encodedNom || "");
    const type = decodeURIComponent(encodedType || "Congé");
    const motif = decodeURIComponent(encodedMotif || "Aucun motif précisé");

    // 2. Gestion du lien document
    let docLink = null;
    if (encodedLink && encodedLink !== 'null' && encodedLink !== 'undefined') {
        docLink = decodeURIComponent(encodedLink);
    }

    let documentHtml = '';
    
    // On récupère l'ID Drive pour construire le mode "Preview"
    const driveId = typeof getDriveId === 'function' ? getDriveId(docLink) : null;

    if (driveId) {
        // C'est un lien Google Drive valide -> ON AFFICHE LA PREVIEW (Compacte)
        const previewUrl = `https://drive.google.com/file/d/${driveId}/preview`;
        
        documentHtml = `
            <div class="mt-4 pt-3 border-t border-slate-100 animate-fadeIn">
                <p class="text-[9px] font-black text-slate-400 uppercase mb-2 flex justify-between items-center">
                    <span>Aperçu</span>
                    <a href="${docLink}" target="_blank" class="text-blue-600 hover:underline cursor-pointer"><i class="fa-solid fa-expand mr-1"></i>Ouvrir</a>
                </p>
                
                <!-- ZONE DE PREVIEW RÉDUITE (Hauteur 180px) -->
                <div class="rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100 relative group h-[180px]">
                    <iframe src="${previewUrl}" width="100%" height="100%" style="border:none;" allow="autoplay"></iframe>
                    <div class="absolute inset-0 bg-black/0 group-hover:bg-black/5 pointer-events-none transition-all"></div>
                </div>
            </div>
        `;
    } 
    else if (docLink && docLink.length > 5) {
        // Lien existe mais pas Google Drive (Compacte)
        documentHtml = `
            <div class="mt-4 pt-3 border-t border-slate-100">
                <p class="text-[9px] font-black text-slate-400 uppercase mb-2">Justificatif</p>
                <div class="text-center">
                    <!-- Image réduite (max-h-40) -->
                    <img src="${docLink}" class="max-h-40 rounded-lg mx-auto border shadow-sm cursor-pointer hover:scale-105 transition-transform" 
                         onclick="Swal.fire({imageUrl: '${docLink}', showConfirmButton: false, width: '90vw'})" 
                         alt="Justificatif" 
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
                    
                    <a href="${docLink}" target="_blank" style="display:none" class="flex items-center gap-2 p-2 border rounded-lg bg-slate-50 hover:bg-slate-100 justify-center">
                        <i class="fa-solid fa-paperclip text-slate-400 text-xs"></i>
                        <span class="text-xs font-bold text-slate-700">Voir le fichier</span>
                    </a>
                </div>
            </div>
        `;
    } 
    else {
        // Aucun document (Compacte)
        documentHtml = `
            <div class="mt-4 pt-3 border-t border-slate-100">
                <div class="flex items-center gap-2 p-2 rounded-lg border border-dashed border-slate-200 text-slate-400 bg-slate-50/50">
                    <i class="fa-solid fa-file-circle-xmark text-xs"></i>
                    <span class="text-[10px] font-bold">Aucun document</span>
                </div>
            </div>
        `;
    }

    // Affichage de la modale (Configuration Compacte)
    Swal.fire({
        html: `
            <div class="text-left font-sans">
                <!-- Header plus serré -->
                <div class="flex justify-between items-start mb-4 border-b border-slate-100 pb-3">
                    <div>
                        <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Collaborateur</p>
                        <h3 class="font-extrabold text-base text-slate-800 leading-tight">${nom}</h3>
                    </div>
                    <div class="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wide border border-blue-100">
                        ${type}
                    </div>
                </div>

                <!-- Dates plus serrées -->
                <div class="bg-slate-50 p-3 rounded-xl border border-slate-100 mb-3">
                    <div class="grid grid-cols-2 gap-2 text-center">
                        <div class="border-r border-slate-200 pr-2">
                            <p class="text-[9px] font-black text-slate-400 uppercase mb-0.5">Du (Matin)</p>
                            <p class="font-bold text-xs text-slate-700">${debut}</p>
                        </div>
                        <div class="pl-2">
                            <p class="text-[9px] font-black text-slate-400 uppercase mb-0.5">Au (Soir)</p>
                            <p class="font-bold text-xs text-slate-700">${fin}</p>
                        </div>
                    </div>
                </div>

                <!-- Motif plus serré -->
                <div>
                    <p class="text-[9px] font-black text-slate-400 uppercase mb-1 ml-1">Motif</p>
                    <div class="bg-white p-3 rounded-xl text-xs text-slate-700 border border-slate-200 italic shadow-sm leading-relaxed">
                        "${motif}"
                    </div>
                </div>
                
                ${documentHtml}
            </div>
        `,
        showConfirmButton: true,
        confirmButtonText: 'Fermer',
        confirmButtonColor: '#0f172a',
        width: 480, // Largeur réduite (était 600)
        padding: '1.25rem', // Padding réduit
        customClass: {
            popup: 'rounded-[1.5rem]'
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





        async function syncOfflineData() {
            const queue = JSON.parse(localStorage.getItem('sirh_offline_queue') || '[]');
            
            if (queue.length === 0) return; // Rien à faire

            const Toast = Swal.mixin({toast: true, position: 'top-end', showConfirmButton: false});
            Toast.fire({icon: 'info', title: `Synchronisation de ${queue.length} pointage(s)...`});

            const remainingQueue = [];

            for (const item of queue) {
                try {
                    // On tente d'envoyer
                    await secureFetch(URL_CLOCK_ACTION, { 
                        method: 'POST', 
                        headers: { 'Content-Type': 'application/json' }, 
                        body: JSON.stringify(item) 
                    });
                } catch (e) {
                    console.error("Echec synchro item", item, e);
                    remainingQueue.push(item); // Si ça rate encore, on le garde pour la prochaine fois
                }
            }

            // Mise à jour de la file d'attente (on ne garde que les échecs)
            localStorage.setItem('sirh_offline_queue', JSON.stringify(remainingQueue));

            if (remainingQueue.length === 0) {
                Toast.fire({icon: 'success', title: 'Tous les pointages ont été synchronisés !'});
                document.getElementById('clock-last-action').innerText = "Dernière action : " + new Date().toLocaleTimeString() + " (Synchronisé)";
            } else {
                Toast.fire({icon: 'warning', title: `Reste ${remainingQueue.length} pointage(s) à envoyer.`});
            }
        }






        window.addEventListener('offline', () => { Swal.fire({ icon: 'warning', title: 'Connexion Perdue', text: 'Mode hors ligne.', toast: true, position: 'top-end', showConfirmButton: false, timer: 5000 }); document.body.classList.add('offline-mode'); });
      
      
      
      
                                                                                    // --- GESTION INTELLIGENTE DU RÉSEAU ---
        window.addEventListener('online', () => { 
            // 1. On ferme les alertes SweetAlert s'il y en a (comme "Pas de connexion")
            Swal.close();
            
            // 2. On affiche un petit toast vert
            const Toast = Swal.mixin({toast: true, position: 'top-end', showConfirmButton: false, timer: 3000});
            Toast.fire({ icon: 'success', title: 'Connexion Rétablie', text: 'Vous êtes de nouveau en ligne.' }); 
            
            // 3. On enlève le mode visuel hors ligne
            document.body.classList.remove('offline-mode'); 
            
            // 4. On synchronise les pointages en attente
            syncOfflineData();

            // 5. On rafraîchit les données visuelles
            if(currentUser) refreshAllData();
        });
    
    
async function fetchLeaveRequests() {
    if (!currentUser || currentUser.role === 'EMPLOYEE') return;

    const body = document.getElementById('leave-requests-body');
    const section = document.getElementById('manager-leave-section');

    // Fonction de nettoyage interne (accents, majuscules, espaces)
    const normalize = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

    try {
        const r = await secureFetch(`${URL_READ_LEAVES}?agent=${encodeURIComponent(currentUser.nom)}`);
        const rawLeaves = await r.json();

        console.log("DEBUG - Données brutes reçues d'Airtable :", rawLeaves);

        allLeaves = rawLeaves.map(l => {
            const clean = (v) => Array.isArray(v) ? v[0] : v;

            const rawNom = clean(l.Employees_nom || l.nom || l['Employé']);
            const statutNet = normalize(clean(l.Statut || l.statut));
            const typeNet = normalize(clean(l.Type || l.type));
            const debutRaw = clean(l['Date Début'] || l['Date de début'] || l.debut);
            const finRaw = clean(l['Date Fin'] || l['Date de fin'] || l.fin);

            // --- AJOUT : Récupération du Motif et du Document ---
            // On récupère 'justificatif_link' comme vu sur ta capture Make
            const motifRaw = clean(l.motif || l.Motif || "Aucun motif");
            const docRaw = clean(l.justificatif_link || l.Justificatif || l.doc || null);

            return {
                id: l.record_id || l.id || '',
                nom: rawNom ? String(rawNom).trim() : null,
                nomIndex: normalize(rawNom), // Pour comparaison stricte
                statut: statutNet,
                type: typeNet,
                debut: debutRaw ? parseDateSmart(debutRaw) : null,
                fin: finRaw ? parseDateSmart(finRaw) : null,
                motif: motifRaw, // Stocké ici
                doc: docRaw      // Stocké ici
            };
        });

        // Interface Manager : On filtre uniquement les "En attente" pour validation
        const pending = allLeaves.filter(l => l.statut === 'en attente');

        if (body) {
            body.innerHTML = '';
            if (pending.length > 0 && section) {
                section.classList.remove('hidden');
                section.style.display = 'block';
                pending.forEach(l => {
                    // --- AJOUT : Préparation des variables sécurisées pour le onclick ---
                    const safeNom = encodeURIComponent(l.nom || 'Inconnu');
                    const safeType = encodeURIComponent(l.type || 'Congé');
                    const dStart = l.debut ? l.debut.toLocaleDateString() : '?';
                    const dEnd = l.fin ? l.fin.toLocaleDateString() : '?';
                    const safeMotif = encodeURIComponent(l.motif);
                    const safeDoc = l.doc ? encodeURIComponent(l.doc) : '';

                    body.innerHTML += `
                        <tr class="border-b hover:bg-slate-50 transition-colors">
                            <td class="px-8 py-4">
                                <div class="font-bold text-sm text-slate-700">${l.nom || 'Inconnu'}</div>
                                <div class="text-[10px] text-slate-400 font-normal uppercase">${l.type || 'Congé'}</div>
                            </td>
                            <td class="px-8 py-4 text-xs text-slate-500">${dStart} ➔ ${dEnd}</td>
                            <td class="px-8 py-4 text-right flex justify-end items-center gap-2">
                                <!-- BOUTON APERÇU (ŒIL) AJOUTÉ ICI -->
                                <button onclick="showLeaveDetail('${safeNom}', '${safeType}', '${dStart}', '${dEnd}', '${safeMotif}', '${safeDoc}')" 
                                        class="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm mr-2" 
                                        title="Voir les détails">
                                    <i class="fa-solid fa-eye"></i>
                                </button>

                                <button onclick="processLeave('${l.id}', 'Validé')" class="bg-emerald-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-md shadow-emerald-200">OUI</button>
                                <button onclick="processLeave('${l.id}', 'Refusé')" class="bg-white text-red-500 border border-red-100 px-4 py-2 rounded-xl text-[10px] font-black uppercase">NON</button>
                            </td>
                        </tr>`;
                });
            } else if (section) {
                section.classList.add('hidden');
            }
        }

        // RECALCUL DU GRAPHIQUE AVEC LES NOUVELLES DONNÉES
        renderCharts();

    } catch (e) {
        console.error("Erreur fetchLeaveRequests:", e);
    }
}


















function renderCharts() {
    if (!employees || employees.length === 0) return;

    // 1. ÉLIMINATION DES DOUBLONS D'EMPLOYÉS (par matricule unique)
    const uniqueEmployees = [];
    const seenIds = new Set();
    employees.forEach(emp => {
        if (!seenIds.has(emp.id)) {
            seenIds.add(emp.id);
            uniqueEmployees.push(emp);
        }
    });

    let counts = { 'Actif': 0, 'Congé': 0, 'Sortie': 0 };
    const today = new Date();
    today.setHours(0, 0, 0, 0); 

    const normalize = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

    console.log("--- DÉBUT CALCUL GRAPHIQUE (PRIORITÉ CUMULÉE) ---");

    uniqueEmployees.forEach(emp => {
        const empNomIndex = normalize(emp.nom);
        const empStatutProfil = normalize(emp.statut);

        // A. PRIORITÉ SORTIE : Si marqué Sortie dans le profil Airtable
        if (empStatutProfil.includes('sortie')) {
            counts['Sortie']++;
            return;
        }

        // B. SOURCE 1 : Vérification dans la table CONGES (Validé + Dates)
        const aUnCongeValideEnTable = allLeaves.some(leave => {
            if (!leave.nomIndex || !leave.debut || !leave.fin) return false;
            
            // Comparaison STRICTE du nom pour éviter de confondre Josue Dominique et Dominique
            const matchNomStrict = (leave.nomIndex === empNomIndex);
            const estValide = (leave.statut === "valide");
            const estDansDates = (today >= leave.debut && today <= leave.fin);
            const nEstPasTele = (!leave.type.includes("teletravail"));

            return matchNomStrict && estValide && estDansDates && nEstPasTele;
        });

        // C. SOURCE 2 : Vérification du statut manuel "Congé" dans la fiche employé
        const estEnCongeDansProfil = empStatutProfil.includes('conge');

        // D. SYNTHÈSE : Si l'un des deux est Vrai, on le compte en congé
        if (aUnCongeValideEnTable || estEnCongeDansProfil) {
            console.info(`[CONGÉ] ${emp.nom} comptabilisé.`);
            counts['Congé']++;
        } else {
            counts['Actif']++;
        }
    });

    // --- SYNCHRONISATION DES CHIFFRES DU DASHBOARD ---
    if(document.getElementById('stat-total')) document.getElementById('stat-total').innerText = uniqueEmployees.length;
    if(document.getElementById('stat-active')) document.getElementById('stat-active').innerText = counts['Actif'];

    // --- RENDU CHART.JS (STATUT) ---
    if (chartStatusInstance) chartStatusInstance.destroy();
    const ctxStatus = document.getElementById('chartStatus').getContext('2d');
    chartStatusInstance = new Chart(ctxStatus, {
        type: 'doughnut',
        data: {
            labels: ['Actif', 'Congé', 'Sortie'],
            datasets: [{
                data: [counts['Actif'], counts['Congé'], counts['Sortie']],
                backgroundColor: ['#10b981', '#f59e0b', '#ef4444'], 
                borderWidth: 0
            }]
        },
        options: { 
            plugins: { legend: { position: 'bottom' } }, 
            cutout: '70%',
            animation: { duration: 800 }
        }
    });

    // --- RENDU CHART.JS (DÉPARTEMENT) ---
    const deptCounts = {};
    uniqueEmployees.forEach(e => { 
        const d = e.dept || 'Inconnu';
        deptCounts[d] = (deptCounts[d] || 0) + 1; 
    });
    if (chartDeptInstance) chartDeptInstance.destroy();
    const ctxDept = document.getElementById('chartDept').getContext('2d');
    chartDeptInstance = new Chart(ctxDept, {
        type: 'bar',
        data: {
            labels: Object.keys(deptCounts),
            datasets: [{ label: 'Collaborateurs', data: Object.values(deptCounts), backgroundColor: '#6366f1', borderRadius: 8 }]
        },
        options: { 
            scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } }, x: { grid: { display: false } } }, 
            plugins: { legend: { display: false } } 
        }
    });
}

 









 

async function fetchFlashMessage() {
    const container = document.getElementById('flash-container');
    if (!container) return;

    try {
        const r = await secureFetch(`${URL_READ_FLASH}?agent=${encodeURIComponent(currentUser.nom)}`);
        let messages = await r.json();
        if (!Array.isArray(messages)) messages = messages ? [messages] : [];

        const lastNotifId = localStorage.getItem('last_flash_id');
        let latestId = null;

        container.innerHTML = '';
        const now = new Date().getTime();
        const normalize = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

        messages.forEach((data, index) => {
            const msgText = data.Message || data.message;
            const msgSender = data.Sender || data.sender;
            const msgType = data.Type || data.type || 'Info';
            const msgDate = data.Date || data.date;
            const msgId = msgDate + msgSender; // Identifiant unique basé sur date et auteur

            if (!msgText || normalize(msgSender) === normalize(currentUser.nom)) return;

            // --- LOGIQUE PUSH NOTIFICATION ---
            // Si c'est le message le plus récent et qu'on ne l'a pas encore notifié
            if (index === 0) {
                latestId = msgId;
                if (lastNotifId !== msgId) {
                    triggerGlobalPush(`NOUVELLE ANNONCE : ${msgType}`, msgText);
                    localStorage.setItem('last_flash_id', msgId);
                }
            }

            // ... (Ici tu gardes ton code de design de la bannière existant) ...
            const styles = {
                'Info': { bg: 'bg-gradient-to-r from-blue-600 to-indigo-600', icon: 'fa-circle-info' },
                'Urgent': { bg: 'bg-gradient-to-r from-red-600 to-rose-600', icon: 'fa-triangle-exclamation' },
                'Maintenance': { bg: 'bg-gradient-to-r from-yellow-500 to-orange-500', icon: 'fa-screwdriver-wrench' }
            };
            const st = styles[msgType] || styles['Info'];
            const msgKey = `flash_closed_${msgId}`;
            if (sessionStorage.getItem(msgKey)) return;

            container.innerHTML += `
                <div id="flash-msg-${index}" class="${st.bg} rounded-2xl p-4 text-white shadow-lg relative overflow-hidden mb-3">
                    <div class="relative z-10 flex items-start gap-4">
                        <div class="p-3 bg-white/20 rounded-xl"><i class="fa-solid ${st.icon} text-xl animate-pulse"></i></div>
                        <div class="flex-1">
                            <div class="flex justify-between items-start">
                                <p class="text-[9px] font-black uppercase opacity-80">${msgType} • PAR ${msgSender.toUpperCase()}</p>
                                <button onclick="closeSpecificFlash('${msgKey}', 'flash-msg-${index}')"><i class="fa-solid fa-xmark"></i></button>
                            </div>
                            <p class="font-bold text-sm">${msgText}</p>
                        </div>
                    </div>
                </div>`;
        });
    } catch (e) { console.warn(e); }
}






// Fonction pour afficher les documents cachés
function toggleMoreDocs(btn) {
    // Affiche tous les éléments cachés
    document.querySelectorAll('.more-docs').forEach(el => {
        el.classList.remove('hidden');
        el.classList.add('animate-fadeIn'); // Petit effet d'apparition
    });
    // Supprime le bouton après le clic
    btn.parentElement.remove();
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
                    fetchLeaveRequests(); // On ne recharge que la liste des congés
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
        'REFUS_IMMEDIAT': { t: 'Refuser la candidature ?', c: '#ef4444', txt: "Un email de refus immédiat sera envoyé." },
        'ACCEPTER_EMBAUCHE': { t: 'Confirmer l\'embauche ?', c: '#10b981', txt: 'Cela créera automatiquement le profil employé et enverra les accès. Les informations restantes devront être mises à jour par la suite' },
        'REFUS_APRES_ENTRETIEN': { t: 'Refuser après entretien ?', c: '#f97316', txt: "Un email personnalisé sera envoyé." }
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
            fetchCandidates(); // On recharge les candidats
                if(action === 'ACCEPTER_EMBAUCHE') fetchData(true); // Si on embauche, on recharge aussi les employés
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


        function clearSignature() {
            if (signaturePad) signaturePad.clear();
        }                                                   




function closeFlashBanner() {
    const banner = document.getElementById('flash-banner');
    if(banner.dataset.key) {
        sessionStorage.setItem(banner.dataset.key, 'true'); // Mémorise la fermeture pour la session
    }
    banner.classList.add('hidden');
}

function openFlashModal() {
    document.getElementById('flash-modal').classList.remove('hidden');
    document.getElementById('flash-input-msg').value = '';
}
 

























// Nouvelle fonction pour fermer UN SEUL message de la pile
function closeSpecificFlash(storageKey, elementId) {
    sessionStorage.setItem(storageKey, 'true');
    const el = document.getElementById(elementId);
    if (el) {
        el.style.opacity = '0';
        el.style.transform = 'translateX(20px)';
        setTimeout(() => el.remove(), 500);
    }
}





  async function fetchPayrollData() {
    const container = document.getElementById('payroll-container');
    if (!container || !currentUser) return;

    try {
        // On appelle ton backend Render qui va interroger le scénario Make n°1
        const r = await secureFetch(`${URL_READ_PAYROLL}?employee_id=${encodeURIComponent(currentUser.id)}&agent=${encodeURIComponent(currentUser.nom)}`);
        const payrolls = await r.json();
        
        container.innerHTML = '';

        if (!payrolls || payrolls.length === 0) {
            container.innerHTML = '<p class="text-[10px] text-slate-400 italic text-center py-4">Aucun bulletin disponible</p>';
            return;
        }

        payrolls.forEach(p => {
            const montant = p.Salaire_Net ? new Intl.NumberFormat('fr-FR').format(p.Salaire_Net) + ' FCFA' : '--';
            const titre = `${p.Mois} ${p.Année}`;
            
            container.innerHTML += `
                <div class="flex items-center justify-between p-3 border border-slate-100 bg-slate-50 rounded-xl hover:bg-white transition-all group shadow-sm">
                    <div class="flex items-center gap-3">
                        <div class="bg-emerald-100 text-emerald-600 p-2 rounded-lg"><i class="fa-solid fa-file-pdf"></i></div>
                        <div>
                            <p class="text-xs font-bold text-slate-700">${titre}</p>
                            <p class="text-[9px] text-emerald-600 font-black uppercase">${montant}</p>
                        </div>
                    </div>
                    <button onclick="viewDocument('${p.Fiche_PDF}', 'Bulletin ${titre}')" class="p-2 text-blue-600 hover:bg-blue-100 rounded-lg">
                        <i class="fa-solid fa-eye"></i>
                    </button>
                </div>
            `;
        });
    } catch (e) {
        console.warn("Erreur bulletins:", e);
        container.innerHTML = '<p class="text-[10px] text-red-400 italic text-center py-4">Erreur de chargement</p>';
    }
}


function exportToCSV() {
    if (employees.length === 0) {
        return Swal.fire('Erreur', 'Aucune donnée à exporter', 'warning');
    }

    // 1. Définir les colonnes à exporter
    const headers = ["Matricule", "Nom Complet", "Poste", "Departement", "Statut", "Email", "Telephone", "Date Embauche", "Duree Contrat"];
    
    // 2. Préparer les données
    let csvContent = headers.join(";") + "\n"; // Utilisation du point-virgule pour Excel France

    employees.forEach(e => {
        const row = [
            e.id,
            e.nom,
            e.poste,
            e.dept,
            e.statut,
            e.email || "",
            e.telephone || "",
            e.date || "",
            e.limit
        ];
        
        // Nettoyage des données pour éviter les bugs de virgules/guillemets
        const cleanRow = row.map(val => `"${String(val).replace(/"/g, '""')}"`);
        csvContent += cleanRow.join(";") + "\n";
    });

    // 3. Créer le fichier et le télécharger
    // Utilisation du BOM UTF-8 (\ufeff) pour que Excel affiche bien les accents (é, à, etc.)
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    const dateStr = new Date().toLocaleDateString().replace(/\//g, "-");
    
    link.setAttribute("href", url);
    link.setAttribute("download", `Rapport_Effectif_${dateStr}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    const Toast = Swal.mixin({toast: true, position: 'top-end', showConfirmButton: false, timer: 3000});
    Toast.fire({ icon: 'success', title: 'Exportation réussie !' });
}





// --- LOGIQUE DARK MODE ---

// 1. Initialisation (au chargement)
function initDarkMode() {
    const isDark = localStorage.getItem('sirh_dark_mode') === 'true';
    if (isDark) {
        document.body.classList.add('dark-mode');
        updateDarkIcon(true);
    }
}

// 2. Basculement
function toggleDarkMode() {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('sirh_dark_mode', isDark);
    updateDarkIcon(isDark);
    
    // Feedback sonore léger ou vibration
    if (navigator.vibrate) navigator.vibrate(50);
}

// 3. Mise à jour de l'icône
function updateDarkIcon(isDark) {
    const icon = document.getElementById('dark-icon');
    const btn = document.querySelector('.dark-toggle-btn');
    if (isDark) {
        icon.classList.replace('fa-moon', 'fa-sun');
        btn.classList.replace('bg-slate-100', 'bg-slate-800');
        btn.classList.replace('text-slate-600', 'text-yellow-400');
    } else {
        icon.classList.replace('fa-sun', 'fa-moon');
        btn.classList.replace('bg-slate-800', 'bg-slate-100');
        btn.classList.replace('text-yellow-400', 'text-slate-600');
    }
}


function applySmartFilter(filterType) {
    currentFilter = filterType;
    currentPage = 1; // On revient à la page 1 lors d'un filtrage
    
    // Mise à jour visuelle des boutons
    document.querySelectorAll('.filter-chip').forEach(btn => {
        btn.classList.remove('active-chip');
        if(btn.innerText.toLowerCase() === filterType.toLowerCase() || (filterType === 'all' && btn.innerText.toLowerCase() === 'tous')) {
            btn.classList.add('active-chip');
        }
    });

    renderData(); // On redessine le tableau
}






// Fonction magique pour décider si on écrit en blanc ou en noir sur une couleur
function getContrastColor(hexColor) {
    // Nettoyer le hex
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    // Calcul de la luminosité (formule standard)
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? '#1e293b' : '#ffffff'; // Si clair -> texte noir, si sombre -> texte blanc
}


function applyBranding() {
    const theme = SIRH_CONFIG.theme;

    // 1. Calcul des couleurs de texte intelligentes
    const textOnPrimary = getContrastColor(theme.primary);
    const textOnAccent = getContrastColor(theme.accent);

    // 2. Application des variables CSS
    const root = document.documentElement;
    root.style.setProperty('--primary', theme.primary);
    root.style.setProperty('--accent', theme.accent);
    root.style.setProperty('--font-main', theme.fontFamily);
    root.style.setProperty('--base-size', theme.baseFontSize);
    root.style.setProperty('--text-on-primary', textOnPrimary);
    root.style.setProperty('--text-on-accent', textOnAccent);

    // 3. Sidebar : Nom et Logo
    const nameEls = document.querySelectorAll('.company-name-display');
    nameEls.forEach(el => {
        el.innerText = SIRH_CONFIG.company.name;
        el.style.color = textOnPrimary; // Le nom s'adapte à la couleur de fond
    });

    const logoSidebar = document.querySelector('.app-logo-display');
    if(logoSidebar) logoSidebar.src = SIRH_CONFIG.company.logo;

    // 4. Écran de Connexion
    const loginTitle = document.querySelector('#login-screen h1');
    if(loginTitle) loginTitle.innerText = SIRH_CONFIG.company.name;
    
    const loginIconContainer = document.querySelector('#login-screen .inline-flex');
    if(loginIconContainer && SIRH_CONFIG.company.logo) {
        loginIconContainer.innerHTML = `<img src="${SIRH_CONFIG.company.logo}" class="w-14 h-14 object-contain">`;
    }

    // 5. Titre du navigateur
    document.title = SIRH_CONFIG.company.name + " | Portail RH";

    console.log(`🎨 Branding intelligent appliqué (${textOnAccent} sur ${theme.accent})`);
}

