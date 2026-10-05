# Interface Studio 6.94.0

## Écran réel intégré

Dans **Côte à côte → Panneaux**, activez **Téléphone réel**. Les quatre panneaux disponibles sont Éditeur, Simulation locale, ChatGPT et Téléphone réel. Ils restent sur une seule ligne avec des séparateurs réglables.

Branchez le téléphone en USB, activez les Options pour les développeurs puis le débogage USB et acceptez l’autorisation sur son écran. Cliquez Actualiser, choisissez le téléphone et Connecter. Ouvrez l’application sur le téléphone : Studio affiche directement son écran, ses données et ses barres Android. Aucune fenêtre externe ni installation de Radio ne sont nécessaires.

Lorsque le décodage vidéo est disponible, la vidéo H.264 utilise la résolution du téléphone et s’ajuste au panneau sans agrandissement automatique. Le zoom 100 % permet d’inspecter les pixels avec défilement. Si la vidéo échoue, le panneau utilise des captures PNG directes. Les clics, glissements, Retour, Accueil et Lecture/pause pilotent le téléphone. La saisie au clavier est limitée aux caractères latins simples ; pour les accents, utilisez le clavier du téléphone affiché dans le panneau. L’audio reste sur le téléphone.

## Actualiser le projet et le téléphone

Recharger (barre du haut) et Actualiser (Téléphone réel) récupèrent les mises à jour du projet lié à GitHub. Pour un APK, Studio télécharge l’unique APK de la dernière publication, ouvre ses ressources dans l’éditeur puis installe ce même fichier sur le téléphone USB sélectionné. Radio intelligente est reconnue par son identifiant Android ; les autres applications utilisent le dépôt lié au projet. Les anciens dossiers de travail restent conservés.

Sans téléphone, seul l’éditeur est actualisé. Une compilation en cours, une publication sans APK, une incompatibilité de signature ou un échec d’installation sont signalés. Studio ne désinstalle pas l’application et n’efface pas ses données. Les APK reconstruits localement doivent encore être exportés ; la synchronisation GitHub récupère les versions publiées.

Validation : tests de disposition à 2/3/4 panneaux, flux Android réel en émulateur sans fenêtre, commandes réelles, résolution native et captures PNG comparées pixel par pixel. Le moteur de la fenêtre d’édition actuelle ne fournit pas VideoDecoder : le mode PNG est donc utilisé et il est moins fluide qu’une vidéo. Aucun téléphone physique Samsung n’était connecté pendant ces tests.

## Nouveautés 6.92

- Radio intelligente 1.14 : marges Android réelles, navigation visible, contenu défilant, paysage et clavier pris en compte. Sources maintenables dans examples/Radio-intelligente-1.14.
- Studio lit automatiquement le profil embarqué dans l'APK. Éditeur et Simulation partagent les mêmes dimensions et marges. Aucun émulateur nécessaire pour utiliser la simulation locale.
- Réservation de la barre latérale en paysage sur téléphone, profil des gestes Android API 35 mesuré à 32 px, couleurs de barres définies par le profil de l'application.
- Les mesures d'un appareil connecté et les marges réglées manuellement remplacent le profil automatique. Le choix est enregistré dans le projet.
- Test du même APK sur Android API 35 et dans Studio : Radio et Musique sur téléphone compact, standard, large, paysage, tablette et navigation par gestes. Contrôles natifs et locaux des votes, de la lecture, de la persistance ; clavier et grands textes sur Android. Deux et trois panneaux conservés.

Les tailles de référence reproduisent les configurations vérifiées ; elles ne remplacent pas les mesures de chaque constructeur. Les icônes système, les polices et les fichiers personnels du téléphone peuvent différer. Le test est effectué sur Android émulé, pas sur le téléphone physique.

## Nouveautés 6.91

- Une seule Simulation locale pour les applications web et les APK web, directement dans Studio. Suppression du choix local/Android et du panneau vidéo Android de cette vue : aucun démarrage d’émulateur, aucune fenêtre supplémentaire, aucun écran noir.
- Le panneau exécute les fichiers de l’application importée, avec ses interactions et son stockage local. Les barres Android restent simulées en superposition ou avec espace réservé, selon le format choisi ; un chevauchement présent dans l’application reste visible.
- L’Éditeur suit le passage Radio / Ma musique effectué dans la Simulation, en utilisant les commandes originales de l’application. Les votes et la lecture ne sont pas rejoués.
- Version interne de l’APK affichée dans le nom du projet. Viewport du périphérique appliqué également lors du chargement de l’Éditeur.
- Vérification de Radio intelligente v110 sur Android API 35 et en local : écrans Radio et Ma musique, navigation identifiée sur Android, dimensions et position du menu inférieur comparées. Tests de lecture/pause, Oui/Non persistants, sélection ChatGPT et dispositions à deux/trois panneaux.
- Les APK contenant uniquement du code Android natif affichent une explication de leur absence de runtime web local ; aucun faux écran interactif ou lancement automatique.

Les titres, fichiers personnels et préférences du téléphone ne sont pas copiés automatiquement sur le PC. La vérification Android mesure le même APK et deux écrans à 412 × 915 ; elle ne prouve pas une identité parfaite avec chaque modèle de téléphone ou chaque version de WebView.


## Nouveautés 6.90

- Récupération d'une ancienne instance Studio qui ne répond plus : vérification de disponibilité, contrôle du nom de l'appareil virtuel, du PID et du chemin du SDK, puis redémarrage du processus bloqué. Aucun effacement de l'appareil virtuel ou de ses images de données.
- Une instance récente dispose toujours du délai de démarrage normal ; une ancienne instance bloquée est détectée plus rapidement.
- « Annuler le démarrage » est disponible pendant l'attente Android et reste autorisé pendant une opération de démarrage. La simulation locale reste accessible.

## Nouveautés 6.89

- Détection d'un émulateur existant par son processus et son appareil virtuel, même lorsqu'il n'est pas encore disponible dans ADB. Réutilisation après confirmation du démarrage Android, au lieu de lancer une seconde instance du même appareil.
- Identification par propriété Android avec retour à la console en secours ; délais bornés pour les commandes de connexion.
- Pour les APK web, retour automatique à Simulation locale si la vérification Android échoue. Le message reste visible au-dessus de l'application.
- Erreur de double instance reformulée ; le journal technique n'envahit plus le panneau. Les détails des erreurs natives restent limités à une zone défilante.

## Nouveautés 6.88

Les APK contenant une application web, dont Radio intelligente v110, utilisent désormais le runtime local par défaut. « Simulation » et « Ouvrir comme appli » exécutent les mêmes fichiers, avec les mêmes services, données locales et réglages de barres. Le démarrage d’Android ne bloque plus leur utilisation.

- Barres système Android superposées au contenu, ou contenu entre les barres, selon le réglage choisi. Les trois boutons et les gestes sont représentés ; une application couverte par la barre conserve ce défaut visible.
- Le morceau affiché dans un ancien instantané Radio est relié au vrai morceau du catalogue avant lecture ou vote. Les commandes de Radio restent ses commandes originales ; les choix Oui/Non persistent après rechargement.
- « Vérifier sur Android » reste disponible. « Simulation locale » permet de revenir immédiatement au runtime web, même pendant un démarrage Android.
- Les applications entièrement natives nécessitent toujours Android ; un runtime web ne remplace pas leurs composants matériels ou leurs services natifs.

Validation : APK v110 réellement importé, lecture et pause, Oui/Non et rechargement, cinq formats, barres superposées et réservées, gestes, sélection synchronisée, fenêtre détachée et retour local pendant un démarrage indisponible. Les panneaux et outils adaptatifs de 6.87 sont conservés.


## Nouveautés 6.87

- Outils adaptatifs à la largeur de leur panneau : une colonne si la place manque, libellés et valeurs longues lisibles, boutons espacés, défilement vertical.
- Comparaison multi-écrans : chaque écran tient entièrement dans sa carte ; les cartes se parcourent verticalement. « Taille réelle » affiche un écran à 100 % pour lire et éditer, puis revient à la comparaison sans recharger le projet.
- ChatGPT reste conservé et masqué pendant la comparaison, sans fenêtre détachée devant les aperçus.
- Android : rendu logiciel SwiftShader sans Vulkan par défaut, démarrage sans ancien instantané ; option graphique automatique disponible pour les applications nécessitant Vulkan. Le journal de panne est nettoyé et enregistré séparément.
- Vérifications sur l’application Windows compilée, 18 configurations de lisibilité, gestes d’édition, création multi-formats et moteur Android 37.2.12 réellement installé sur le PC.

La compatibilité graphique ne dispense pas des prérequis Android : virtualisation Windows disponible, mémoire et stockage suffisants. Les essais sur ce PC et plusieurs dimensions ne constituent pas un essai sur toutes les machines. Les données des appareils virtuels existants sont conservées.


## Nouveautés 6.86

Version construite sur la 6.85. Elle conserve la présentation harmonisée, les sections d'édition repliées, les formats multiples et la sélection synchronisée.

- Clic droit maintenu : déplacement de la vue ; molette : zoom autour du pointeur.
- Ctrl+Z et Ctrl+Y : historique d'édition corrigé, y compris après déplacement au clavier.
- Échap : désélection et annulation du geste en cours.
- ChatGPT : poignée pour déplacer verticalement la saisie, réglage de position et conservation locale du brouillon.
- APK avec interface web : lancement automatique dans le vrai moteur Android, avec ses barres système et sa densité. L'éditeur des ressources est distingué de la simulation native.
- Importation APK : inspection possible avec les Build Tools fournis si le SDK choisi est incomplet.
- Correction de l'injection de l'éditeur pendant le chargement d'une page.

Vérification dans l'exécutable Windows : gestes, historique, Échap, deux/trois panneaux, séparateurs, lecture audio et sélection synchronisée ; ouverture de Radio 1.13 dans Android réel. Comparaison multi-formats et création d'un projet avec variantes téléphone/tablette/ordinateur/TV. La saisie ChatGPT a été vérifiée sur une page représentative, sans envoi de message dans une conversation authentifiée.

Le portable comprend les outils APK et Java. Le moteur et les images Android nécessitent une préparation initiale. Les ancrages d'aperçu restent des paramètres du projet ; la conversion de tous les ancrages en contraintes du code source n'est pas automatique. Consulter le guide joint avant de publier une application adaptée à plusieurs écrans.

## Présentation 6.85, basée sur la 6.84

La fenêtre d’ouverture utilise des cartes régulières avec un titre et une description sur des lignes distinctes. Sa hauteur s’adapte à la fenêtre et son contenu reste accessible par défilement. La barre de travail rassemble les contrôles des panneaux et leur ordre dans le menu **Panneaux** ; les flèches de chaque panneau et le déplacement par glissement sont conservés.

Les outils d’édition sont regroupés en **Écran et repères**, **Éléments et calques**, **Mise en page**, **Apparence et contenu**, **Tests et diagnostics**, **Projet et fichiers**. À chaque ouverture du menu d’édition, les catégories, sections et sous-sections sont repliées, y compris si des sections étaient ouvertes précédemment. La conservation des panneaux et du ChatGPT de la 6.84 est maintenue.

Validation visuelle Windows : `node app/scripts/test-polish.cjs` vérifie quatre tailles de fenêtre, la séparation des titres/descriptions, la réouverture repliée et les trois modes d’affichage. Les tests d’interface 6.84 et de disposition/interactions complètent ces vérifications.

## Interface personnalisable

- Déplacer les panneaux avec les flèches de leur titre, par glisser-déposer, ou avec les commandes d’ordre de la barre supérieure. L’ordre et les largeurs sont conservés.
- Le texte commence à l’équivalent du précédent maximum (130 %), puis s’adapte au format de l’écran. Paramètres permet d’ajuster la taille ou de désactiver l’adaptation. Les contenus des applications ne sont pas modifiés.
- Outils édition ouvre un dock dans le panneau Éditeur. Fermer ou Échap le referme. Les fonctions sont classées dans cinq catégories repliables.
- ChatGPT conserve une seule discussion lors des passages entre le dock et sa fenêtre séparée. Détacher, Réduire et Rétablir permettent de garder la discussion ouverte pendant le développement multi-formats. La zone de prompt est agrandie.
- Préférences → Commandes → Modifier les raccourcis permet de réassigner les touches, de créer une action à partir d’une commande ou d’enregistrer des boutons et réglages des outils. Les actions sont conservées localement.
- Les boutons supérieurs sont regroupés en Projet, Développer, Android, ChatGPT et Préférences. Les options Android et ChatGPT restent accessibles dans leurs catégories.
- Trois propositions d’icône se trouvent dans `design/`. L’icône actuelle reste utilisée jusqu’au choix d’une proposition.

Validation 6.84 : tests de commandes et de persistance ; vérification Chromium à 1920, 1520 et 1100 pixels, avec deux et trois panneaux, dock intégré et police uniforme. Le cycle de vie de la vue ChatGPT est contrôlé avec des doubles Electron ; la conversation authentifiée et l’exécutable Windows n’ont pas été exécutés dans cet environnement.

## Créer et développer dans plusieurs formats

Cliquer sur **Créer une application**, choisir son nom, les formats et le format à l’ouverture, puis choisir le dossier de destination. Studio crée un nouveau sous-dossier avec une application HTML/CSS/JavaScript fonctionnelle et adaptative. Les fichiers restent modifiables et les formats sont conservés dans `studio-project.json` et la sauvegarde Studio.

**Développer multi-formats** affiche le même projet dans les formats choisis. **Éditer ici** active un écran ; **Base commune** modifie les règles communes et **Adaptation du format actif** cible les règles téléphone, tablette, ordinateur ou TV. Les variantes de téléphone utilisent les règles de largeur communes ; elles ne créent pas des applications séparées. **Choisir les formats** permet d’ajouter des formats personnalisés et de changer le format d’ouverture. Tester ensuite les vrais boutons dans Simulation.

## Applications Android natives dans Simulation

Ouvrir un APK autonome : Studio prépare puis lance automatiquement le moteur Android. **Lancer sur Android** reste disponible pour une relance. Studio installe et lance réellement l’application dans un émulateur local, transmet les clics, gestes et touches, et affiche son écran en direct. **Photos de test** copie des images dans Android : les ouvrir ensuite avec le sélecteur de fichiers de l’application. Les dimensions Android sont réellement modifiées lors d’un changement de format ; le panneau conserve les proportions de cet écran.

Si le moteur manque, **Préparer Android** présente la taille du téléchargement officiel et les licences à accepter, puis récupère les composants Google avec vérification des empreintes. La virtualisation Windows doit être disponible. Le portable comprend les outils APK et Java ; les images système Android, volumineuses, sont téléchargées séparément. La préparation complète depuis un PC sans moteur Android n’a pas été testée par téléchargement intégral ; les catalogues officiels et l’exécution avec les composants installés ont été vérifiés.

Photo TV v0.12 a été exécuté dans Android TV : importation et choix de deux photos, diaporama, pause, reprise et photo suivante vérifiés. Sur Android TV, choisir **Photos de test Studio** dans le sélecteur ; le sélecteur Activity Stub de certaines images Google ne renvoie aucun fichier. Le sélecteur Studio est inclus et installé dans cet émulateur lors de l’importation. Les applications dessinées dans un Canvas peuvent n’exposer qu’une vue complète à la sélection, sans éléments individuels ni styles CSS. L’édition native dépend des ressources disponibles dans l’APK et nécessite une recompilation pour changer le comportement. La création guidée de cette version produit une application web ; elle ne génère pas un projet Kotlin natif. Les APK fractionnés, dépendances matérielles et architectures incompatibles peuvent nécessiter un environnement spécifique.

Éditeur visuel Windows autonome avec Éditeur, Simulation et ChatGPT sur une seule ligne.

## Télécharger et ouvrir

La [release Windows](https://github.com/Wokgui/Interface-Studio/releases/tag/v6.83.0) contient le portable et les sources modifiables. Lancer `App-Interface-Studio-6.83.0-portable-x64.exe`, puis ouvrir ou créer une application. Aucun téléphone physique n’est nécessaire. Electron, Java et les outils d’importation APK sont inclus.

## Formats téléphone, TV et ordinateur

Le choix Écran reste accessible dans la barre principale. Il contient plusieurs dimensions de téléphone, un pliable ouvert, une tablette, une TV 16:9, un ordinateur, un mode Adaptatif et des dimensions personnalisées de 240 à 8192 pixels CSS. Pivoter inverse la largeur et la hauteur sans recharger l’application. Les réglages sont mémorisés séparément pour chaque source.

Automatique utilise les mesures d’un appareil importé ou le profil des ressources Android, notamment Photo TV en 1280 × 720. Une application web peut déclarer ses dimensions avec `<meta name="studio-screen" content="1920x1080 tv">` (types phone, tablet, tv ou desktop). En l’absence de ces informations, Studio utilise un format de travail initial : téléphone pour Radio intelligente et ordinateur pour les autres sources. Il ne peut pas déduire le modèle physique d’un téléphone à partir d’un APK universel.

Les formats fixes conservent leur ratio et s’ajustent à la place du panneau sans étirer ni rogner l’écran. Adaptatif change réellement le viewport de chaque panneau : les media queries et la disposition de l’application s’appliquent à sa largeur. Cette option ne réécrit pas une application dont l’interface n’est pas responsive. Les dimensions personnalisées sont logiques (CSS), distinctes de la résolution physique et de la densité de pixels du téléphone.

Les formats et le moteur d’exécution sont indépendants. Photo TV est une application Kotlin/Android native : l’importation reconnaît le paysage et Simulation utilise Android pour son diaporama et ses accès aux photos. Les programmes Windows natifs ne peuvent pas être exécutés ni rendus éditables par le runtime web de Studio.

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
npm run test:creation
# Avec AIS_ANDROID_TEST_SDK et AIS_ANDROID_TEST_APK définis :
npm run test:native
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
## Ouverture simple depuis GitHub

Dans **Ouvrir une application → GitHub**, coller par exemple `https://github.com/Wokgui/L4D2`, puis cliquer **Ouvrir l’application**. Studio télécharge une copie locale, détecte sa page HTML ou son projet Android et l’ouvre. Aucun téléchargement ZIP manuel n’est nécessaire. Les changements effectués dans Studio restent locaux ; ce parcours ne publie rien sur le dépôt d’origine.

Ce parcours prend en charge les dépôts publics GitHub et les liens de branche. Pour un dépôt privé, ouvrir une copie locale avec **Dossier local**. Les applications web qui exigent une compilation ou un serveur doivent encore être préparées avant leur ouverture. Le parcours L4D2 est vérifié par `npm run test:github --prefix app` (récupération réelle, navigation, recherche, tirage et comparaison des formats).

La lecture de la hiérarchie Android utilise un fichier neuf et validé à chaque demande, même si la commande de capture se termine avec une erreur après avoir écrit son résultat. Aucun résultat ancien n’est réutilisé.

### Rejouer la comparaison Radio 1.14

Dans PowerShell, définir `$env:AIS_TEST_APK` avec le chemin de l’APK 1.14 téléchargé, puis exécuter `npm run test:native` depuis `app`. Le test crée son propre appareil virtuel et ne vide que les données de cette application dans cet appareil de test. Le SDK Android API 35 doit être disponible ; cela concerne le banc de vérification, pas la Simulation utilisée au quotidien. Les rapports et captures sont enregistrés dans `test-results/shared-radio`.
