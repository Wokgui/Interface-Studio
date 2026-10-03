# Interface Studio

Dépôt autonome d’Interface Studio.

## Version de référence

**6.78.0** — dérivée de la base Windows 6.77.0 récupérée le 3 octobre 2026.

### Vue multi-panneaux 6.78

Le mode **Côte à côte** permet de choisir librement de 1 à 3 panneaux parmi :

- Éditeur
- Android / exécution
- ChatGPT

Les séparateurs sont redimensionnables à la souris et au clavier, les proportions sont mémorisées et un bouton permet de rétablir des largeurs égales. ChatGPT conserve également son mode fenêtre flottante.

## Organisation

- `app/` : processus Electron et scripts desktop.
- `webapp/` : éditeur visuel et interface.
- Les sources historiques provenaient du dépôt Radio-intelligente. À partir de la 6.78, Interface Studio est un projet autonome dans ce dépôt.

## Validation 6.78

Tous les fichiers JavaScript et CommonJS du paquet Windows 6.78 ont passé `node --check`.
