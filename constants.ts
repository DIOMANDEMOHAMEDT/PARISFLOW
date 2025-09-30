import { Column } from './types';

export const COLUMNS: Column[] = [
  {
    id: 'shortlist',
    title: '1. Repérage des Matchs',
    description: 'Matchs à potentiel : +2.5 buts ≥ 65%, Moyenne buts ≥ 2.7, BTTS ≥ 60%.',
  },
  {
    id: 'form_check',
    title: '2. Vérification de la Forme',
    description: 'Analyse de la forme récente : xG > 1.5, xGA > 1.2, 4 des 5 derniers matchs en +2.5 buts.',
  },
  {
    id: 'odds_check',
    title: '3. Contrôle des Cotes',
    description: 'Vérification des cotes et de la valeur : Cote Over 2.5 entre 1.40 et 1.70.',
  },
  {
    id: 'final_selection',
    title: '4. Sélection Finale',
    description: 'Matchs prêts à être ajoutés au combiné. Choisissez 2 ou 3 matchs.',
  },
  {
    id: 'archived',
    title: '5. Paris Archivés',
    description: 'Matchs inclus dans des paris qui ont été placés.',
  }
];