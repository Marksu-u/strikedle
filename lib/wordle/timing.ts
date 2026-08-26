// Cadence de la révélation d'une ligne.
//
// Posée ici plutôt que dans la feuille de style parce que le délai dépend de la
// colonne : la tuile pose durée et délai en ligne, et la classe CSS ne garde
// que le nom, la courbe et le mode de remplissage (cf. .wordle-tile-flip).
//
// Le total d'une ligne vaut (longueur - 1) x FLIP_STAGGER_MS + FLIP_MS. Rien
// dans le jeu ne recalcule cette somme : la fin de la cascade est lue sur
// l'événement `animationend` de la dernière colonne, jamais sur un minuteur
// parallèle qui dériverait de la CSS.
export const FLIP_MS = 300;
export const FLIP_STAGGER_MS = 150;

// Rebond de la ligne gagnante, joué une fois la cascade terminée. Décalage plus
// serré que la bascule : c'est une vague qui traverse le mot, pas une seconde
// révélation.
export const BOUNCE_MS = 420;
export const BOUNCE_STAGGER_MS = 70;

// Secousse d'un mot refusé. Partagée par l'animation et par le minuteur qui
// remet le drapeau `invalid` à zéro : plus court, le drapeau tombait pendant la
// secousse et la ligne se replaçait d'un coup au milieu du mouvement.
export const SHAKE_MS = 450;
