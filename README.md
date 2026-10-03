# Interface Studio 6.82.0

Éditeur visuel Windows autonome avec Éditeur, Simulation et ChatGPT sur une seule ligne.

## Télécharger et ouvrir

La [release Windows](https://github.com/Wokgui/Interface-Studio/releases/tag/v6.82.0) contient le portable et les sources modifiables. Lancer `App-Interface-Studio-6.82.0-portable-x64.exe`, puis ouvrir une application HTML, un dossier ou un APK contenant une application web. Aucun téléphone ni Android Studio n’est nécessaire à cette exécution locale. Electron, Java et les outils d’importation APK sont inclus.

## Formats téléphone, TV et ordinateur

Le choix Écran reste accessible dans la barre principale. Il contient plusieurs dimensions de téléphone, un pliable ouvert, une tablette, une TV 16:9, un ordinateur, un mode Adaptatif et des dimensions personnalisées de 240 à 8192 pixels CSS. Pivoter inverse la largeur et la hauteur sans recharger l’application. Les réglages sont mémorisés séparément pour chaque source.

Automatique utilise les mesures d’un appareil importé ou le profil des ressources Android, notamment Photo TV en 1280 × 720. Une application web peut déclarer ses dimensions avec `<meta name="studio-screen" content="1920x1080 tv">` (types phone, tablet, tv ou desktop). En l’absence de ces informations, Studio utilise un format de travail initial : téléphone pour Radio intelligente et ordinateur pour les autres sources. Il ne peut pas déduire le modèle physique d’un téléphone à partir d’un APK universel.

Les formats fixes conservent leur ratio et s’ajustent à la place du panneau sans étirer ni rogner l’écran. Adaptatif change réellement le viewport de chaque panneau : les media queries et la disposition de l’application s’appliquent à sa largeur. Cette option ne réécrit pas une application dont l’interface n’est pas responsive. Les dimensions personnalisées sont logiques (CSS), distinctes de la résolution physique et de la densité de pixels du téléphone.

Les formats et le moteur d’exécution sont indépendants. Photo TV est une application Kotlin/Android native : l’importation reconnaît le paysage, mais son diaporama et ses accès aux photos demandent Android. Un message lisible et un bouton Ouvrir les outils Android remplacent la fausse simulation. Les programmes Windows natifs ne peuvent pas être exécutés ni rendus éditables par le runtime web de Studio.

Validation ajoutée : 36 combinaisons de neuf profils, deux tailles de fenêtre et deux/trois panneaux ; viewport, proportions, absence de débordement du cadre, vraie interaction web, rotation, dimensions personnalisées, mémorisation et réorganisation responsive. L’APK Photo TV v0.12 est également importé pour vérifier son profil paysage et la distinction entre aperçu et exécution.

## Simulation réelle

La Simulation charge le vrai HTML, CSS et JavaScript de l’application ouverte, avec audio, formulaires, stockage local, IndexedDB, fichiers et navigation. Elle conserve son instance pendant les changements de disposition. L’éditeur embarqué dans certains APK est exclu de cette vue pour laisser les boutons agir normalement.

Pour les anciennes sauvegardes de Radio intelligente, le morceau affiché est restauré dans l’état du vrai moteur avant Lecture. Son extrait est récupéré dans le catalogue Deezer et ses liens signés expirés sont renouvelés. Aucun son de démonstration ne remplace le morceau. Les extraits et services en ligne nécessitent Internet et restent soumis à leur disponibilité.

Le service `/api/youtube-search` utilisé par Radio intelligente est disponible localement. Les autres applications nécessitant un serveur propre doivent être ouvertes à l’adresse de ce serveur. Une application Android entièrement native, sans runtime web, nécessite le moteur Android facultatif ; l’aperçu XML n’est pas présenté comme une exécution native.

## Panneaux et sélection

- Choisir Édition, Simulation ou Côte à côte, puis cocher un, deux ou trois panneaux.
- Deux panneaux utilisent chacun la moitié de la zone ; trois utilisent chacun un tiers par défaut.
- Déplacer les séparateurs ou utiliser leurs flèches clavier. Les proportions sont mémorisées ; « Largeurs égales » les réinitialise.
- Chaque écran s’ajuste à son propre panneau ; le zoom ChatGPT suit également sa largeur.
- ChatGPT contient sa conversation et le bouton Réglages. Les options de compte, fichiers et modifications s’ouvrent avec ce bouton.
- Dans la Simulation, « Sélectionner » désigne un élément sans déclencher son action. « Interagir » rétablit les interactions ordinaires. La sélection et son contexte sont synchronisés avec l’Éditeur et ChatGPT.
- Les changements CSS de l’Éditeur apparaissent dans la Simulation sans interrompre le runtime. Recharger relance les sources modifiées.

## Sources autonomes

`app/` contient Electron, les modules APK et ChatGPT, et les tests. `webapp/` contient l’éditeur, la Simulation et la démonstration.

Avec Node.js sous Windows :

```powershell
cd app
npm ci
npm start
npm run check
npm run test:workspace
npm run test:screens
npm run smoke
npm run dist:win
```

Le lancement depuis les sources et la compilation récupèrent, si nécessaire, le runtime APK Windows de cette release et vérifient son SHA-256. Il est déjà inclus dans le portable. `prepare-apk-runtime.cjs` permet aussi de le construire depuis un JDK 17 et Android Build-Tools 35.0.0. Les licences accompagnent le runtime et les outils dans `app/vendor`. Les anciens scripts historiques sont conservés ; les commandes ci-dessus sont les vérifications actives de ce dépôt.

## Validation de la 6.81

Tests dans Electron et dans la version Windows compilée, avec la source web et un APK Radio intelligente v112 :

- 12 configurations : quatre combinaisons de deux/trois panneaux, sur 2048×900, 1520×1000 et 1100×720.
- Panneaux sur une ligne, largeur totale utilisée et écran contenu dans son panneau.
- Séparateurs souris/clavier, réinitialisation des largeurs et conservation de l’instance.
- Lecture réelle de Vainglory — Helios, progression audio, pause, reprise et positionnement.
- Navigation Réglages/Retour, choix Oui, état enregistré et annulation.
- Sélection Simulation → Éditeur → contexte ChatGPT, et propagation d’une vraie modification CSS.
- Vue ChatGPT native alignée sur son panneau, et retrait de cette vue pendant l’affichage des réglages.
- Aucune erreur JavaScript non interceptée dans ces parcours.

Le smoke test vérifie aussi les transactions, annulations, captures, exports portables, scénarios et rapports. Son audit ergonomique de l’application Radio signale encore de petites cibles tactiles dans les 12 profils. Ce diagnostic de l’application ouverte est distinct des vérifications de disposition de Studio.

La base locale complète 6.73 a fourni les modules absents du dépôt 6.78. Les captures de la conversation ont été récupérées et examinées. Les archives 6.79/6.80 citées dans la conversation n’étaient pas disponibles comme fichiers ; les corrections sont reconstruites et validées dans ce dépôt autonome.
