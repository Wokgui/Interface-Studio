# Interface Studio 6.86 — gestes et adaptation aux écrans

Dans Édition, maintenir le bouton droit et tirer déplace la vue. La molette zoome autour du pointeur. Ces deux gestes changent seulement la vue de travail, sans modifier l'application.

Ctrl+Z annule la dernière modification d'édition ; Ctrl+Y la rétablit. Échap désélectionne et annule un déplacement ou un redimensionnement encore en cours. Quand un champ de texte possède le focus, ses raccourcis de saisie habituels restent prioritaires.

Dans ChatGPT, tirer la poignée « Déplacer la saisie » vers le haut ou le bas. Le bouton Réglages propose aussi « Position du champ de saisie ». La position reste enregistrée localement. Revenir à zéro rétablit la position normale. L'ajustement conserve le brouillon et n'envoie aucun message. Il dépend de la structure du site ChatGPT : une modification ultérieure du site peut nécessiter une adaptation de Studio.

## Préparer une application pour plusieurs formats

1. À la création, sélectionner téléphone, tablette, ordinateur et/ou TV, puis le format d'ouverture. Pour un projet existant, ouvrir Développer multi-formats et Choisir les formats.
2. Travailler la Base commune pour ce qui doit rester identique. Utiliser Adaptation du format actif pour une disposition différente sur tablette ou TV, par exemple une colonne sur téléphone et deux sur tablette.
3. Utiliser une mise en page organisée par le parent (rangée, colonne ou grille), des largeurs en pourcentage ou un remplissage disponible, et des limites de taille. Éviter de placer tous les éléments à des coordonnées fixes. Un bouton peut garder une hauteur lisible alors que sa largeur s'adapte.
4. Prévoir les barres système, encoches, zones sûres et le clavier. Une résolution en pixels ne décrit pas à elle seule l'espace utile : Android utilise aussi une densité d'affichage et des marges système.
5. Vérifier les petits et grands téléphones, la tablette et le paysage ; pour une TV, vérifier aussi le 16/9 et les interactions à la télécommande. Examiner les retours à la ligne, le défilement et l'accessibilité des boutons.
6. Enregistrer le projet Studio, puis appliquer les changements aux sources ou reconstruire l'APK. Ouvrir cet APK final dans Simulation et contrôler ensuite un vrai appareil avant diffusion.

Les largeurs/hauteurs relatives et les variantes de format sont exportées en CSS. Les ancrages de l'aperçu sont conservés dans le projet Studio, mais leur conversion en contraintes du code de chaque application n'est pas automatique : certains sont seulement décrits dans les commentaires du CSS exporté. Il faut donc faire appliquer ces contraintes au code source pour un placement durable. Le zoom, une capture ou une sauvegarde de projet seuls ne prouvent pas l'adaptation universelle d'une application existante.

## Pourquoi Radio pouvait paraître correcte sur le bureau

L'éditeur HTML affiche les ressources de l'application ; il ne recrée pas toute la fenêtre Android. Une application ciblant Android 15/API 35 peut être affichée sous les barres système. Sans gestion des marges Android, les boutons du bas se retrouvent derrière la navigation du téléphone.

Studio 6.86 lance désormais les APK contenant une interface web dans le moteur Android réel, comme les APK natifs. L'éditeur reste une aide d'édition des ressources ; Simulation montre la fenêtre Android exécutée. Cette distinction est indiquée dans l'interface. Le moteur demande une préparation initiale s'il n'est pas installé.

Radio 1.13 réserve les marges réelles des barres système, de l'encoche et du clavier dans sa fenêtre native. Le bas reste accessible et le contenu peut défiler sur un petit écran.

Oui ajoute le morceau aux Gardés. Non l'enregistre dans les Passés/Rejetés, sans l'ajouter aux Gardés. Revenir sur le dernier choix annule cette décision. Les choix sont sauvegardés localement ; dans la simulation Android, ils appartiennent à l'appareil virtuel. Ils ne modifient pas automatiquement la bibliothèque du téléphone. Pour transférer une bibliothèque, utiliser les fonctions de sauvegarde/restauration de Radio.

Sources officielles :
- https://developer.android.com/about/versions/15/behavior-changes-15
- https://developer.android.com/develop/ui/views/layout/edge-to-edge

## Validation et limites

Les gestes d'édition et les dispositions à deux/trois panneaux ont été exercés dans l'exécutable Windows. Les essais de Radio utilisent un émulateur Android API 35 avec navigation à trois boutons et par gestes, petit écran, paysage, tablette et clavier. La lecture d'un fichier importé et la conservation des données après réinstallation de 1.13 sont vérifiées.

Le déplacement de la saisie ChatGPT est testé sur des pages représentatives ; une conversation authentifiée Chat/Work n'a pas été manipulée pour envoyer des messages. Aucun essai sur le téléphone physique de l'utilisateur n'a été réalisé.

L'APK Radio conserve l'identifiant app.radiointelligente. La signature de l'APK 1.11 installé n'a pas pu être comparée, faute de son fichier original. Android n'accepte une mise à jour conservant les données que si la signature correspond. En cas de refus, ne pas désinstaller la version contenant les données : il faut retrouver sa clé de signature.
