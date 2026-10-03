# Interface Studio 6.81.0

Éditeur visuel Windows autonome avec Éditeur, Simulation et ChatGPT sur une seule ligne.

## Télécharger et ouvrir

La [release Windows](https://github.com/Wokgui/Interface-Studio/releases/tag/v6.81.0) contient le portable et les sources modifiables. Lancer `App-Interface-Studio-6.81.0-portable-x64.exe`, puis ouvrir une application HTML, un dossier ou un APK contenant une application web. Aucun téléphone ni Android Studio n’est nécessaire à cette exécution locale. Electron, Java et les outils d’importation APK sont inclus.

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
