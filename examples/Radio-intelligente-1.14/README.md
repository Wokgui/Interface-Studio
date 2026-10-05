# Radio intelligente 1.14

Cette version réserve les marges Android mesurées par WindowInsets (barres, encoche, clavier), garde le menu inférieur visible et permet de faire défiler le reste de l'écran. Elle reprend les sources originales 1.11 et les correctifs de conservation des votes de 1.13. Le numéro 1.14 évite toute ambiguïté avec l'ancien APK v110 / version interne 1.10.

Les fichiers de la racine et du dossier assets sont identiques. Android utilise assets ; Interface Studio peut ouvrir directement l'APK ou ce dossier. android-window-profile.json déclare le conteneur et les valeurs de référence Android API 35, dont les gestes à 32 px. Sur un téléphone, ces valeurs sont mesurées par Android et ne sont jamais imposées par ce fichier.

Compilation des sources : JDK 17, SDK Android 35, Gradle compatible avec Android Gradle Plugin 8.7.3. Depuis android, exécuter gradle :app:assembleDebug. Aucune clé privée n'est fournie. Conserver une clé de signature compatible pour mettre à jour une installation existante. L'identifiant app.radiointelligente et les clés de stockage restent inchangés.

Les morceaux et préférences de votre téléphone ne sont pas automatiquement copiés dans Studio. Pour une comparaison de contenu, utiliser les mêmes fichiers musicaux et les mêmes données. Voir PROVENANCE.md.
