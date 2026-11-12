# Prépa Trainer

PWA d'entraînement (calcul mental, maths, physique, chimie, finance, logique, japonais). Aucune installation : HTML/JS statique.

## Tester sur Mac
```bash
cd prepa-trainer && python3 -m http.server 8000
```
puis ouvrir http://localhost:8000 (Safari : Fichier ▸ Ajouter au Dock).

## Utiliser sur iPhone
Il faut servir le dossier en HTTPS : glisser-déposer `prepa-trainer` sur https://app.netlify.com/drop (ou GitHub Pages), ouvrir l'URL dans Safari iPhone, Partager ▸ « Sur l'écran d'accueil ». Fonctionne ensuite hors-ligne.

## Mémoire
Données locales à l'appareil. Réglages ⚙️ ▸ Exporter / Importer pour passer iPhone ↔ Mac (l'import fusionne l'historique).

## Tests
Ouvrir `tests.html` : ~390 générateurs × 300 tirages (réponse acceptée, QCM sans doublon, explication présente, vérification numérique indépendante des dérivées/intégrales/limites).
