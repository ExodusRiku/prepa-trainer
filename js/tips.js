// Méthodes générales par sous-thème : ajoutées à l'explication de chaque question
export const TIPS = {
  'Addition / soustraction': 'Additionne par blocs (centaines, dizaines, unités) ou arrondis à la dizaine/centaine puis corrige : 78 + 47 = 78 + 50 − 3 = 125.',
  'Multiplication': 'Décompose un facteur : 47 × 6 = 40×6 + 7×6 = 240 + 42. Pour ×5, ×25, ×50, ×125 passe par ×10, ×100, ×1000 puis divise ; pour 99×n, calcule 100n − n.',
  'Carrés / cubes': '(a+b)² = a² + 2ab + b². Pour un nombre qui finit par 5 : d×(d+1) puis « 25 ». Pour n² proche de 50 ou 100, utilise (50±k)² = 2500 ± 100k + k².',
  'Division': 'Cherche d’abord le multiple connu le plus proche, puis ajuste le reste. Pour ÷4 divise deux fois par 2 ; ÷5 = ×2 puis ÷10 ; ÷25 = ×4 puis ÷100.',
  'Pourcentages': 'Appuie-toi sur 10 % (décale la virgule) et 1 % : 15 % = 10 % + 5 %. Variation en %, c’est (nouvelle − ancienne)/ancienne. Des variations successives se multiplient (coefficients multiplicateurs), elles ne s’additionnent pas.',
  'Fractions': 'Mets au même dénominateur pour additionner, multiplie numérateurs et dénominateurs pour multiplier, puis simplifie par le PGCD.',
  'Racines / puissances': 'Encadre entre deux carrés parfaits. Rappels : 2¹⁰ ≈ 10³, a^m·a^n = a^(m+n), a^(p/q) = (racine q-ième de a)^p.',
  'Algèbre rapide': 'Isole l’inconnue, utilise les identités remarquables a²−b² = (a−b)(a+b), (a+b)² = a²+2ab+b², et les relations somme/produit des racines.',
  'Conversions': '1 m/s = 3,6 km/h ; 1 L = 10⁻³ m³ ; 1 bar = 10⁵ Pa. Convertis toujours avec la puissance de 10 de l’unité, pas « à vue ».',
  'Logarithmes / approx.': 'Retiens : log 2 ≈ 0,301 ; log 3 ≈ 0,477 ; ln 2 ≈ 0,693 ; ln 10 ≈ 2,303 ; e ≈ 2,718 ; 2¹⁰ ≈ 10³. ln(1+x) ≈ x et e^x ≈ 1+x pour x petit.',
  'Ordre de grandeur': 'Arrondis chaque nombre à 1 ou 2 chiffres significatifs, additionne les exposants de 10 puis multiplie les mantisses. Vise un facteur 2, pas la précision.',
  'Dérivation': 'Règles : (uv)′ = u′v + uv′ ; (u/v)′ = (u′v − uv′)/v² ; (f∘g)′ = g′·f′(g). Dérivées usuelles : (e^x)′=e^x, (ln x)′=1/x, (sin)′=cos, (cos)′=−sin, (tan)′=1+tan², (arctan)′=1/(1+x²).',
  'Intégration': 'Cherche une primitive (reconnaître u′/u, u′e^u, u′u^n), sinon intégration par parties ∫u′v = [uv] − ∫uv′ ou changement de variable. Vérifie le signe et l’ordre de grandeur.',
  'Limites / DL': 'Équivalents en 0 : sin x ~ x, tan x ~ x, e^x−1 ~ x, ln(1+x) ~ x, 1−cos x ~ x²/2. Pour une forme 1^∞ passe par l’exponentielle : u^v = e^(v ln u).',
  'Matrices': 'det 2×2 = ad − bc ; trace = somme des valeurs propres ; det = produit des valeurs propres ; (AB)ᵢⱼ = ligne i de A · colonne j de B.',
  'Vecteurs': 'u·v = Σ uᵢvᵢ ; (u×v)_z = u_x v_y − u_y v_x ; projection de u sur v : (u·v/‖v‖²) v.',
  'Analyse multivariée': 'Dérive par rapport à une variable en gardant les autres constantes. div F = Σ ∂Fᵢ/∂xᵢ ; Laplacien = div(grad). Points critiques : gradient nul, puis signe du déterminant de la hessienne.',
  'Suites / séries': 'Somme géométrique : (1−q^(n+1))/(1−q) ; série géométrique infinie 1/(1−q) si |q|<1. Σk = n(n+1)/2, Σk² = n(n+1)(2n+1)/6, Σk³ = (Σk)². Utilise le télescopage 1/(k(k+1)) = 1/k − 1/(k+1).',
  'Complexes': 'Passe en forme exponentielle z = r e^(iθ) pour les puissances et racines ; pour un quotient multiplie par le conjugué ; |z|² = a² + b².',
  'Équa. diff.': '1er ordre : y = solution particulière + K e^(−at). 2nd ordre : équation caractéristique r² + br + c = 0 ; racines réelles → exponentielles, complexes ±iω → cos/sin.',
  'Probas / dénombrement': 'C(n,k) = n!/(k!(n−k)!) ; arrangements n!/(n−k)! ; P(A|B) = P(A∩B)/P(B) ; Bayes : P(M|+) = P(+|M)P(M)/P(+). Linéarité de l’espérance.',
};

Object.assign(TIPS, {
  'Mécanique': 'Méthode : 1) choisis le système et le référentiel galiléen, 2) liste les forces, 3) projette le PFD (ΣF = ma) ou utilise l’énergie (Ec + Ep conservée sans frottement). Vérifie toujours les unités SI.',
  'Fluides & matériaux': 'Hydrostatique P = P₀ + ρgh ; continuité S₁v₁ = S₂v₂ ; Bernoulli P + ½ρv² + ρgz = cste (fluide parfait) ; Re = ρvD/η ; loi de Hooke σ = Eε.',
  'Gravitation & astro': 'Force gravitationnelle GMm/r². Orbite circulaire : GM/r² = v²/r. 3ᵉ loi de Kepler T²/a³ = 4π²/(GM). Vitesse de libération = √2 × vitesse de satellisation.',
  'Thermodynamique': 'PV = nRT ; 1ᵉʳ principe ΔU = W + Q ; adiabatique réversible TV^(γ−1) = cste ; ΔS = nR ln(V₂/V₁) en isotherme ; rendement de Carnot 1 − T_f/T_c ; Φ = λSΔT/e.',
  'Électrocinétique': 'Loi des mailles et des nœuds, diviseur de tension, impédances Z_R = R, Z_L = jLω, Z_C = 1/(jCω). Constante de temps RC ou L/R ; résonance ω₀ = 1/√(LC).',
  'Électromagnétisme': 'Coulomb F = qq′/(4πε₀r²) ; Lorentz F = q(E + v×B) ; Biot–Savart (fil) B = µ₀I/(2πr) ; loi de Faraday e = −dΦ/dt ; onde plane E = cB.',
  'Optique': 'Snell n₁ sinθ₁ = n₂ sinθ₂ ; lentille mince 1/p′ − 1/p = 1/f′ ; interfrange i = λD/a ; réseau sinθ = kλ/p ; diffraction θ ≈ λ/a.',
  'Ondes & acoustique': 'v = λf ; corde f_n = n v/(2L) ; niveau sonore L = 10 log(I/I₀) ; Doppler f′ = f v/(v ∓ v_s) ; tuyau ouvert f = v/(2L), fermé f = v/(4L).',
  'Physique quantique': 'E = hν = hc/λ ≈ 1240/λ(nm) eV ; Bohr E_n = −13,6/n² eV ; de Broglie λ = h/p ; Heisenberg ΔxΔp ≥ ħ/2 ; N = N₀ 2^(−t/T½).',
  'Relativité': 'γ = 1/√(1−β²) ; Δt = γΔτ ; L = L₀/γ ; E = γmc² ; E² = (pc)² + (mc²)² ; composition u = (v₁+v₂)/(1+v₁v₂/c²).',
});

Object.assign(TIPS, {
  'Solutions & dosages': 'n = m/M = CV ; C₁V₁ = C₂V₂ pour une dilution ; à l’équivalence d’un dosage, les réactifs sont dans les proportions stœchiométriques de l’équation. Fais un tableau d’avancement.',
  'Acido-basique': 'pH = −log[H₃O⁺] ; acide fort pH = −log C ; acide faible pH = ½(pKa − log C) ; tampon pH = pKa + log([A⁻]/[AH]) ; pKe = 14. Le pH d’un ampholyte vaut ½(pKa₁ + pKa₂).',
  'Thermochimie': 'ΔrH° = ΣνΔfH°(produits) − ΣνΔfH°(réactifs) ; ΔG° = ΔH° − TΔS° = −RT ln K ; sens d’évolution : Q < K → direct. Le Chatelier : le système s’oppose à la perturbation.',
  'Cinétique': 'Ordre 0 : [A] = [A]₀ − kt ; ordre 1 : ln[A] = ln[A]₀ − kt, t½ = ln2/k ; ordre 2 : 1/[A] = 1/[A]₀ + kt ; Arrhenius k = A e^(−Ea/RT).',
  'Électrochimie': 'Nernst : E = E° + (0,06/n) log([Ox]/[Red]) ; f.é.m. = E_cathode − E_anode ; ΔG = −nFE ; Faraday : n(e⁻) = It/F.',
  'Structure & cristallo': 'Remplissage : Klechkowski, Pauli, Hund. CFC : 4 atomes/maille, compacité 0,74, coordinence 12 ; ρ = Z M/(N_A a³). VSEPR : compte les doublets (liants + libres) autour de l’atome central.',
  'Chimie organique': 'DBE = (2C + 2 + N − H − X)/2 ; 2ⁿ stéréoisomères pour n centres ; IR : C=O ≈ 1700, O–H ≈ 3300 (large), C≡N ≈ 2250 cm⁻¹ ; SN1 (carbocation, tertiaire) vs SN2 (primaire, bon nucléophile) vs E2 (base forte).',
  'Gaz & équilibres': 'P_i = x_i P_tot ; PV = nRT ; K = Π a_i^νi (solides purs : activité 1) ; tableau d’avancement, puis loi d’action de masse.',
});

Object.assign(TIPS, {
  'Valorisation & VAN': 'VAN = Σ CFₜ/(1+r)ᵗ ; perpétuité C/r, croissante C₁/(r−g) ; TRI : taux qui annule la VAN (MOIC^(1/n) − 1 si deux flux) ; VE = fonds propres + dette nette.',
  'Structure financière': 'MEDAF : r_f + β(R_m − r_f) ; WACC = E/V·ke + D/V·kd·(1−t) ; Hamada β_L = β_U[1 + (1−t)D/E] ; ROE = [ROA + (ROA − i)D/E](1−t).',
  'Gestion & ratios': 'BFR = stocks + créances − dettes d’exploitation ; seuil = charges fixes/(taux de marge sur CV) ; FCF = EBITDA − impôt sur EBIT − Capex − ΔBFR ; DuPont : marge × rotation × levier.',
  'Marchés : taux & obligations': 'Prix = Σ flux actualisés ; ΔP/P ≈ −D_mod Δy ; taux à terme (1+y₂)² = (1+y₁)(1+f) ; taux équivalent (1+a)^(1/12) − 1 ; Fisher (1+r)(1+i) = 1+nominal.',
  'Marchés : options & dérivés': 'Forward F = S(1+r)^T ; parité C − P = S − K/(1+r)^T ; payoff call max(S−K,0) ; arbre binomial p = (1+r−d)/(u−d) ; delta-hedge = −Δ × quantité ; ATM C ≈ 0,4 S σ √T.',
  'Portefeuille & risque': 'σ_p² = Σ wᵢ²σᵢ² + 2Σ wᵢwⱼρσᵢσⱼ ; Sharpe = (R − r_f)/σ ; β = Cov/Var(marché) ; VaR = zσV (1,65 à 95 %, 2,33 à 99 %).',
  'Cas tests': 'Procède étape par étape : chaque réponse sert à la suivante (VE → dette → fonds propres → TRI). Garde toujours en tête l’ordre de grandeur pour détecter une erreur.',
});

Object.assign(TIPS, {
  'Matrices de motifs': 'Analyse chaque attribut (forme, nombre, rotation, remplissage) séparément, ligne par ligne puis colonne par colonne : cherche carré latin (chaque valeur une fois par ligne/colonne), progression constante, ou règle de somme.',
  'Suites numériques': 'Calcule les différences successives (arithmétique, quadratique si les 2ᵈᵉˢ différences sont constantes), puis les rapports (géométrique), puis cherche une récurrence ou deux suites entrelacées.',
  'Lettres & mots': 'Convertis les lettres en rangs (A=1 … Z=26) et traite-les comme une suite numérique ; pense aux suites entrelacées et aux décalages alternés.',
  'Déduction': 'Formalise : liste les hypothèses, teste chaque cas possible (tables de vérité, cas chevalier/valet), cherche la contradiction. P ⇒ Q équivaut à non Q ⇒ non P, mais pas à Q ⇒ P.',
  'Combinatoire logique': 'Cherche d’abord une relation de récurrence ou un principe de comptage (C(n,k), tiroirs, 3^k issues pour k pesées). Teste sur de petits cas (n = 1, 2, 3) avant de généraliser.',
  'Binaire & bases': 'Puissances de 2 : 1, 2, 4, 8, 16, 32, 64. XOR : 1 si les bits diffèrent ; ET : 1 si les deux bits valent 1 ; OU : 1 si au moins un bit vaut 1. Hexadécimal : 1 chiffre = 4 bits.',
  'Hiragana': 'Syllabaire des mots japonais : 46 kana de base, dakuten (゛ : k→g, s→z, t→d, h→b) et handakuten (゜ : h→p), yōon (kya, shu, cho…). Écris chaque caractère à la main pour mémoriser le tracé.',
  'Katakana': 'Mêmes sons que les hiragana mais pour les mots étrangers, noms propres, onomatopées. Pièges classiques : シ/ツ, ソ/ン, ク/ケ, ス/ヌ, ウ/ワ. ー allonge la voyelle.',
  'Kanji (sens)': 'Beaucoup de kanji sont des pictogrammes (日 soleil, 山 montagne, 川 rivière) ou des combinaisons (休 = 人 + 木 : se reposer contre un arbre). Retiens aussi les radicaux.',
  'Kanji (lectures)': 'Deux familles de lectures : on’yomi (d’origine chinoise, dans les composés : 学校 gakkō) et kun’yomi (japonaise, kanji seul + okurigana : 食べる taberu). Apprends les mots, pas seulement les kanji isolés.',
  'Nombres & dates': '一二三四五六七八九十 = 1 à 10 ; 十一 = 11 ; 二十 = 20 ; 百 = 100 (三百 = 300) ; 千 = 1000 ; 万 = 10 000. Mois : nombre + 月 (4月 = しがつ, 7月 = しちがつ, 9月 = くがつ). Jours : 日月火水木金土.',
  'Grammaire de base': 'は = thème, が = sujet, を = objet direct, に = destination/temps/destinataire, で = lieu d’action/moyen, の = possession/lien entre noms. Forme polie : ます (négatif ません, passé ました).',
});
