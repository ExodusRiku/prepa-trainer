import mental from './mental.js';
import maths from './maths.js';
import physique from './physique.js';
import chimie from './chimie.js';
import finance from './finance.js';
import logique from './logique.js';
import japonais from './japonais.js';

export const THEMES = [
  { id: 'mental', name: 'Calcul mental', icon: '🧮', color: '#f59e0b', desc: 'Exact ou ordre de grandeur', gens: mental, oom: true },
  { id: 'maths', name: 'Mathématiques', icon: '∫', color: '#6366f1', desc: 'Dérivées, intégrales, matrices…', gens: maths },
  { id: 'physique', name: 'Physique', icon: '⚛️', color: '#06b6d4', desc: 'Prépa / école d’ingé, chiffres ronds', gens: physique },
  { id: 'chimie', name: 'Chimie', icon: '🧪', color: '#10b981', desc: 'Solutions, thermo, cinétique…', gens: chimie },
  { id: 'finance', name: 'Finance', icon: '📈', color: '#ec4899', desc: 'Entreprise, marché, cas tests', gens: finance },
  { id: 'logique', name: 'Logique', icon: '🧩', color: '#8b5cf6', desc: 'Suites, patterns, déduction', gens: logique },
  { id: 'japonais', name: 'Japonais', icon: '🇯🇵', color: '#ef4444', desc: 'Hiragana, katakana, kanji', gens: japonais },
];
