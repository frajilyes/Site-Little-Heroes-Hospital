-- =====================================================================
--  Données de démonstration — dates relatives à aujourd'hui (CURDATE())
--  (le compte administrateur est créé par scripts/setup-db.mjs)
-- =====================================================================

SET NAMES utf8mb4;

INSERT INTO services (slug, nom, accroche, description, icone, couleur, etage, telephone, lits_total, urgence_24h) VALUES
('urgences', 'Urgences pédiatriques', 'Une équipe prête à accueillir votre enfant 24h/24, 7j/7.',
 'Notre service d''urgences pédiatriques accueille les enfants de 0 à 18 ans à toute heure. Un circuit court dédié aux bobos du quotidien, des box colorés, des infirmières formées à la gestion de la douleur et une salle d''attente ludique pour que l''attente soit plus douce. Le tri est réalisé dès l''arrivée par une infirmière d''accueil et d''orientation.',
 'siren', 'rose', 'Rez-de-chaussée — Aile A', '01 23 45 67 00', 18, 1),
('neonatologie', 'Néonatologie', 'Prendre soin des tout-petits dès leurs premiers jours.',
 'Le service de néonatologie prend en charge les nouveau-nés prématurés ou malades. Les parents sont accueillis 24h/24, le peau-à-peau est encouragé et une chambre parents est disponible. Une équipe de puéricultrices accompagne chaque famille vers le retour à la maison.',
 'baby', 'sky', '1er étage — Aile B', '01 23 45 67 10', 24, 1),
('cardiologie', 'Cardiologie pédiatrique', 'Des petits cœurs suivis par de grands spécialistes.',
 'Consultations, échographies cardiaques, holters et suivi des cardiopathies congénitales. Nous accompagnons les enfants et les adolescents avant et après une chirurgie cardiaque, en lien étroit avec les équipes de chirurgie.',
 'heart-pulse', 'red', '2e étage — Aile A', '01 23 45 67 20', 12, 0),
('chirurgie', 'Chirurgie pédiatrique', 'Opérer en douceur, rassurer à chaque étape.',
 'Chirurgie viscérale, orthopédique et ORL de l''enfant. Les enfants peuvent descendre au bloc en petite voiture électrique, accompagnés d''un parent jusqu''à l''induction. La majorité des interventions se font en ambulatoire.',
 'scissors', 'amber', '3e étage — Aile A', '01 23 45 67 30', 20, 0),
('hemato-oncologie', 'Hémato-oncologie', 'Combattre la maladie, ensemble, avec le sourire.',
 'Prise en charge des cancers et maladies du sang de l''enfant. Hôpital de jour, chambres stériles, école à l''hôpital, soins de support (psychologue, socio-esthéticienne, art-thérapie) pour accompagner l''enfant et toute sa famille.',
 'ribbon', 'violet', '4e étage — Aile B', '01 23 45 67 40', 16, 0),
('neurologie', 'Neurologie pédiatrique', 'Comprendre le cerveau qui grandit.',
 'Épilepsie, migraines, troubles du développement et maladies neuromusculaires. Électroencéphalogrammes dans une salle adaptée aux enfants, consultations pluridisciplinaires avec kinésithérapeutes et orthophonistes.',
 'brain', 'indigo', '2e étage — Aile B', '01 23 45 67 50', 10, 0),
('pneumologie', 'Pneumo-allergologie', 'Respirer mieux pour jouer plus.',
 'Asthme, allergies alimentaires et respiratoires, mucoviscidose. École de l''asthme pour apprendre à utiliser son inhalateur en s''amusant, tests allergologiques et épreuves fonctionnelles respiratoires.',
 'wind', 'emerald', '1er étage — Aile A', '01 23 45 67 60', 12, 0),
('pedopsychiatrie', 'Pédopsychiatrie', 'Écouter, comprendre et accompagner.',
 'Accueil des enfants et adolescents en souffrance psychique : anxiété, troubles alimentaires, troubles du comportement. Consultations, hôpital de jour et groupes thérapeutiques (théâtre, médiation animale, musique).',
 'smile', 'teal', '5e étage — Aile A', '01 23 45 67 70', 14, 0);

INSERT INTO medecins (prenom, nom, titre, specialite, service_id, bio, experience_ans, langues, avatar, disponible) VALUES
('Camille', 'Laurent',  'Dr',   'Urgentiste pédiatre',            1, 'Chef du service des urgences, Camille a fait de la gestion de la douleur chez l''enfant son combat quotidien.', 15, 'Français, Anglais', '👩‍⚕️', 1),
('Yanis',   'Benali',   'Dr',   'Pédiatre urgentiste',            1, 'Passionné de médecine d''urgence et de magie, Yanis a toujours un tour dans sa poche pour détendre ses patients.', 8, 'Français, Arabe, Anglais', '👨‍⚕️', 1),
('Sophie',  'Martin',   'Pr',   'Néonatologiste',                 2, 'Professeure de néonatologie, spécialiste des grands prématurés et des soins de développement.', 22, 'Français, Anglais', '👩‍⚕️', 1),
('Lucas',   'Moreau',   'Dr',   'Pédiatre néonatologue',          2, 'Lucas coordonne le programme de peau-à-peau et d''accompagnement des parents.', 10, 'Français, Espagnol', '👨‍⚕️', 1),
('Inès',    'Dubois',   'Dr',   'Cardiopédiatre',                 3, 'Spécialiste des cardiopathies congénitales et de l''échographie cardiaque fœtale.', 14, 'Français, Anglais, Italien', '👩‍⚕️', 1),
('Thomas',  'Girard',   'Dr',   'Cardiologue pédiatrique',        3, 'Thomas suit les jeunes sportifs et les adolescents porteurs de troubles du rythme.', 9, 'Français, Anglais', '👨‍⚕️', 0),
('Amélie',  'Rousseau', 'Pr',   'Chirurgienne viscérale',         4, 'Pionnière de la chirurgie mini-invasive chez l''enfant, Amélie dirige le bloc pédiatrique.', 20, 'Français, Anglais, Allemand', '👩‍⚕️', 1),
('Karim',   'Haddad',   'Dr',   'Chirurgien orthopédiste',        4, 'Fractures, scolioses, pieds bots : Karim remet les petits héros sur pied depuis plus de 12 ans.', 12, 'Français, Arabe', '👨‍⚕️', 1),
('Claire',  'Fontaine', 'Pr',   'Hémato-oncologue',               5, 'Claire coordonne la recherche clinique et le programme de soins de support du service.', 18, 'Français, Anglais', '👩‍⚕️', 1),
('Hugo',    'Lefèvre',  'Dr',   'Oncopédiatre',                   5, 'Hugo accompagne les adolescents et jeunes adultes, et anime l''atelier jeux vidéo du mercredi.', 7, 'Français, Anglais', '👨‍⚕️', 1),
('Nadia',   'Ouali',    'Dr',   'Neuropédiatre',                  6, 'Experte en épilepsie de l''enfant et en troubles du neurodéveloppement.', 13, 'Français, Arabe, Anglais', '👩‍⚕️', 1),
('Julien',  'Petit',    'Dr',   'Neuropédiatre',                  6, 'Julien s''intéresse aux migraines de l''enfant et aux maladies neuromusculaires.', 6, 'Français', '👨‍⚕️', 1),
('Léa',     'Bernard',  'Dr',   'Pneumo-pédiatre',                7, 'Créatrice de l''école de l''asthme, Léa apprend aux enfants à dompter leur souffle.', 11, 'Français, Anglais', '👩‍⚕️', 1),
('Mathis',  'Roux',     'Dr',   'Allergologue pédiatre',          7, 'Mathis réalise les tests et les réintroductions alimentaires en hôpital de jour.', 8, 'Français, Portugais', '👨‍⚕️', 1),
('Emma',    'Chevalier','Dr',   'Pédopsychiatre',                 8, 'Emma anime des groupes thérapeutiques autour du théâtre et de l''expression corporelle.', 16, 'Français, Anglais', '👩‍⚕️', 1),
('Rayan',   'Mercier',  'Dr',   'Psychologue clinicien',          8, 'Rayan accompagne les adolescents et coordonne la médiation animale avec nos chiens d''assistance.', 9, 'Français, Anglais, Arabe', '👨‍⚕️', 1);

INSERT INTO activites (titre, description, categorie, age_min, age_max, lieu, jour, heure_debut, heure_fin, places, animateur, emoji) VALUES
('Atelier peinture magique', 'Peinture à doigts, aquarelle et pochoirs : chaque enfant repart avec son chef-d''œuvre accroché dans sa chambre.', 'art', 3, 12, 'Salle Arc-en-ciel', 1, '10:00', '11:30', 10, 'Mila, art-thérapeute', '🎨'),
('Les docteurs clowns', 'Le Dr Patate et le Pr Chaussette passent dans les chambres pour des visites… complètement loufoques !', 'clown', 0, 18, 'Dans les chambres', 1, '14:00', '17:00', 30, 'Compagnie Nez Rouge', '🤡'),
('Éveil musical', 'Instruments, comptines et percussions corporelles pour les tout-petits et leurs parents.', 'musique', 0, 5, 'Salle Arc-en-ciel', 2, '10:00', '11:00', 8, 'Jules, musicothérapeute', '🎵'),
('Lecture sous la tente', 'Une grande tente, des coussins, des lampes de poche et des histoires à dormir debout.', 'lecture', 3, 10, 'Bibliothèque des Héros', 2, '16:00', '17:00', 12, 'Bénévoles Lire & Grandir', '📚'),
('Petits scientifiques', 'Volcans, slime et expériences colorées : la science, c''est magique !', 'science', 6, 14, 'Labo des curieux', 3, '10:00', '11:30', 10, 'Association Savants en herbe', '🧪'),
('Tournoi de jeux vidéo', 'Consoles, casques VR et tournoi Mario Kart entre services. Fair-play obligatoire !', 'jeux', 8, 18, 'Espace Ados', 3, '14:30', '17:00', 16, 'Dr Hugo Lefèvre & Léo', '🎮'),
('Visite des chiens câlins', 'Pepper et Biscuit, nos chiens d''assistance, viennent faire des câlins et des tours.', 'animaux', 3, 18, 'Jardin thérapeutique', 3, '15:00', '16:30', 12, 'Rayan Mercier & Handi''Chiens', '🐶'),
('Yoga des petits héros', 'Postures d''animaux, respiration du ballon et relaxation pour apprivoiser ses émotions.', 'bien-etre', 4, 12, 'Salle Zen', 4, '10:30', '11:30', 10, 'Anaïs, kinésithérapeute', '🧘'),
('Atelier pâte à modeler', 'Modelage, argile et création de petits monstres rigolos.', 'art', 3, 10, 'Salle Arc-en-ciel', 4, '14:00', '15:30', 10, 'Mila, art-thérapeute', '🧸'),
('Chorale des couloirs', 'On chante ensemble et on prépare le grand concert de fin de mois !', 'musique', 6, 18, 'Auditorium', 4, '16:00', '17:00', 25, 'Jules, musicothérapeute', '🎤'),
('Gym douce & motricité', 'Parcours de motricité, ballons géants et jeux d''équilibre adaptés à chacun.', 'sport', 3, 12, 'Gymnase adapté', 5, '10:00', '11:00', 8, 'Anaïs, kinésithérapeute', '⚽'),
('Jeux de société géants', 'Puissance 4 géant, Uno, Dobble et jeux coopératifs pour toute la famille.', 'jeux', 5, 18, 'Ludothèque', 5, '14:00', '16:00', 20, 'Ludothèque Les Dés Rieurs', '🎲'),
('Cinéma pop-corn', 'Projection d''un dessin animé sur grand écran avec pop-corn (si le docteur est d''accord !).', 'jeux', 3, 18, 'Auditorium', 5, '17:00', '18:30', 40, 'Équipe d''animation', '🍿'),
('Cuisine des chefs', 'Recettes simples et gourmandes adaptées aux régimes de chacun, avec la diététicienne.', 'bien-etre', 6, 16, 'Cuisine pédagogique', 6, '10:00', '11:30', 8, 'Chloé, diététicienne', '🧁'),
('Spectacle de magie', 'Disparitions, cartes et lapins : un vrai magicien en visite chaque samedi.', 'clown', 3, 18, 'Auditorium', 6, '15:00', '16:00', 50, 'Le Grand Zébulon', '🎩'),
('Ateliers BD & mangas', 'Apprendre à dessiner ses personnages préférés et créer sa propre planche.', 'art', 9, 18, 'Espace Ados', 6, '14:00', '15:30', 10, 'Yuki, illustratrice', '✏️'),
('Conte du dimanche', 'Un conteur fait voyager petits et grands avec des histoires du monde entier.', 'lecture', 3, 12, 'Bibliothèque des Héros', 7, '11:00', '12:00', 15, 'Compagnie Il était une fois', '🧚'),
('Jardinage au potager', 'Semer, arroser, récolter : un coin de nature pour respirer et observer.', 'science', 5, 15, 'Jardin thérapeutique', 7, '15:00', '16:00', 10, 'Bénévoles Mains Vertes', '🌱');

INSERT INTO inscriptions_activites (activite_id, date_seance, enfant_nom, age, chambre, parent_nom, telephone) VALUES
(1, CURDATE(), 'Lina R.', 6, '204', 'Mme Robert', '06 11 22 33 44'),
(1, CURDATE(), 'Noé B.', 8, '211', 'M. Blanc', '06 22 33 44 55'),
(5, CURDATE(), 'Adam K.', 10, '305', 'Mme Kader', '06 33 44 55 66'),
(6, CURDATE(), 'Sacha M.', 13, '402', 'M. Morel', '06 44 55 66 77'),
(7, CURDATE(), 'Jade P.', 7, '118', 'Mme Picard', '06 55 66 77 88'),
(8, CURDATE(), 'Tom L.', 5, '120', 'Mme Lopez', '06 66 77 88 99');

INSERT INTO patients (prenom, nom, date_naissance, sexe, groupe_sanguin, allergies, service_id, medecin_id, chambre, date_admission, date_sortie_prevue, statut, parent_nom, parent_tel) VALUES
('Lina',   'Robert',   DATE_SUB(CURDATE(), INTERVAL 75 MONTH),  'F', 'A+',  NULL,                 4, 7,  '204', DATE_SUB(CURDATE(), INTERVAL 3 DAY),  DATE_ADD(CURDATE(), INTERVAL 2 DAY),  'hospitalise', 'Julie Robert',  '06 11 22 33 44'),
('Noé',    'Blanc',    DATE_SUB(CURDATE(), INTERVAL 98 MONTH),  'M', 'O+',  'Pénicilline',        4, 8,  '211', DATE_SUB(CURDATE(), INTERVAL 5 DAY),  DATE_ADD(CURDATE(), INTERVAL 4 DAY),  'hospitalise', 'Marc Blanc',    '06 22 33 44 55'),
('Adam',   'Kader',    DATE_SUB(CURDATE(), INTERVAL 122 MONTH), 'M', 'B+',  NULL,                 3, 5,  '305', DATE_SUB(CURDATE(), INTERVAL 2 DAY),  DATE_ADD(CURDATE(), INTERVAL 5 DAY),  'hospitalise', 'Sonia Kader',   '06 33 44 55 66'),
('Sacha',  'Morel',    DATE_SUB(CURDATE(), INTERVAL 160 MONTH), 'M', 'A-',  'Arachide',           5, 9,  '402', DATE_SUB(CURDATE(), INTERVAL 20 DAY), DATE_ADD(CURDATE(), INTERVAL 10 DAY), 'hospitalise', 'Paul Morel',    '06 44 55 66 77'),
('Jade',   'Picard',   DATE_SUB(CURDATE(), INTERVAL 86 MONTH),  'F', 'O-',  NULL,                 7, 13, '118', DATE_SUB(CURDATE(), INTERVAL 1 DAY),  DATE_ADD(CURDATE(), INTERVAL 2 DAY),  'observation', 'Claire Picard', '06 55 66 77 88'),
('Tom',    'Lopez',    DATE_SUB(CURDATE(), INTERVAL 62 MONTH),  'M', 'AB+', 'Lactose',            7, 14, '120', DATE_SUB(CURDATE(), INTERVAL 2 DAY),  DATE_ADD(CURDATE(), INTERVAL 1 DAY),  'hospitalise', 'Ana Lopez',     '06 66 77 88 99'),
('Rose',   'Garnier',  DATE_SUB(CURDATE(), INTERVAL 1 MONTH),   'F', 'A+',  NULL,                 2, 3,  'N03', DATE_SUB(CURDATE(), INTERVAL 25 DAY), DATE_ADD(CURDATE(), INTERVAL 15 DAY), 'hospitalise', 'Laura Garnier', '06 12 13 14 15'),
('Léon',   'Faure',    DATE_SUB(CURDATE(), INTERVAL 0 MONTH),   'M', 'O+',  NULL,                 2, 4,  'N07', DATE_SUB(CURDATE(), INTERVAL 4 DAY),  DATE_ADD(CURDATE(), INTERVAL 20 DAY), 'hospitalise', 'Eva Faure',     '06 16 17 18 19'),
('Mia',    'Perrin',   DATE_SUB(CURDATE(), INTERVAL 2 MONTH),   'F', 'B-',  NULL,                 2, 3,  'N09', DATE_SUB(CURDATE(), INTERVAL 10 DAY), DATE_ADD(CURDATE(), INTERVAL 6 DAY),  'hospitalise', 'Inès Perrin',   '06 20 21 22 23'),
('Ethan',  'Simon',    DATE_SUB(CURDATE(), INTERVAL 48 MONTH),  'M', 'A+',  'Ibuprofène',         1, 1,  'U05', CURDATE(),                           CURDATE(),                            'observation', 'Nora Simon',    '06 24 25 26 27'),
('Zoé',    'Lambert',  DATE_SUB(CURDATE(), INTERVAL 30 MONTH),  'F', 'O+',  NULL,                 1, 2,  'U02', CURDATE(),                           DATE_ADD(CURDATE(), INTERVAL 1 DAY),  'observation', 'Hugo Lambert',  '06 28 29 30 31'),
('Louis',  'Bonnet',   DATE_SUB(CURDATE(), INTERVAL 140 MONTH), 'M', 'A+',  NULL,                 6, 11, '221', DATE_SUB(CURDATE(), INTERVAL 6 DAY),  DATE_ADD(CURDATE(), INTERVAL 3 DAY),  'hospitalise', 'Lise Bonnet',   '06 32 33 34 35'),
('Chloé',  'François', DATE_SUB(CURDATE(), INTERVAL 105 MONTH), 'F', 'B+',  'Latex',              6, 12, '223', DATE_SUB(CURDATE(), INTERVAL 2 DAY),  DATE_ADD(CURDATE(), INTERVAL 2 DAY),  'hospitalise', 'Yves François', '06 36 37 38 39'),
('Gabriel','Muller',   DATE_SUB(CURDATE(), INTERVAL 175 MONTH), 'M', 'O+',  NULL,                 8, 15, '510', DATE_SUB(CURDATE(), INTERVAL 12 DAY), DATE_ADD(CURDATE(), INTERVAL 9 DAY),  'hospitalise', 'Anne Muller',   '06 40 41 42 43'),
('Manon',  'Henry',    DATE_SUB(CURDATE(), INTERVAL 190 MONTH), 'F', 'A-',  NULL,                 8, 16, '512', DATE_SUB(CURDATE(), INTERVAL 8 DAY),  DATE_ADD(CURDATE(), INTERVAL 12 DAY), 'hospitalise', 'Rémi Henry',    '06 44 45 46 47'),
('Arthur', 'Roussel',  DATE_SUB(CURDATE(), INTERVAL 92 MONTH),  'M', 'AB-', NULL,                 5, 10, '405', DATE_SUB(CURDATE(), INTERVAL 30 DAY), DATE_ADD(CURDATE(), INTERVAL 7 DAY),  'hospitalise', 'Léa Roussel',   '06 48 49 50 51'),
('Alice',  'Vincent',  DATE_SUB(CURDATE(), INTERVAL 70 MONTH),  'F', 'O+',  'Œuf',               5, 9,  '407', DATE_SUB(CURDATE(), INTERVAL 15 DAY), DATE_ADD(CURDATE(), INTERVAL 5 DAY),  'hospitalise', 'Marie Vincent', '06 52 53 54 55'),
('Paul',   'Dupont',   DATE_SUB(CURDATE(), INTERVAL 130 MONTH), 'M', 'A+',  NULL,                 3, 6,  '307', DATE_SUB(CURDATE(), INTERVAL 1 DAY),  DATE_ADD(CURDATE(), INTERVAL 3 DAY),  'hospitalise', 'Luc Dupont',    '06 56 57 58 59'),
('Nina',   'Leroy',    DATE_SUB(CURDATE(), INTERVAL 55 MONTH),  'F', 'B+',  NULL,                 4, 7,  '208', DATE_SUB(CURDATE(), INTERVAL 9 DAY),  DATE_SUB(CURDATE(), INTERVAL 2 DAY),  'sorti',       'Eric Leroy',    '06 60 61 62 63'),
('Hugo',   'Michel',   DATE_SUB(CURDATE(), INTERVAL 115 MONTH), 'M', 'O-',  NULL,                 7, 13, '115', DATE_SUB(CURDATE(), INTERVAL 7 DAY),  DATE_SUB(CURDATE(), INTERVAL 1 DAY),  'sorti',       'Sara Michel',   '06 64 65 66 67'),
('Lou',    'Fournier', DATE_SUB(CURDATE(), INTERVAL 40 MONTH),  'F', 'A+',  NULL,                 1, 1,  'U04', DATE_SUB(CURDATE(), INTERVAL 3 DAY),  DATE_SUB(CURDATE(), INTERVAL 3 DAY),  'sorti',       'Ben Fournier',  '06 68 69 70 71'),
('Jules',  'Girard',   DATE_SUB(CURDATE(), INTERVAL 150 MONTH), 'M', 'B+',  'Pollen',             7, 14, '122', DATE_SUB(CURDATE(), INTERVAL 1 DAY),  DATE_ADD(CURDATE(), INTERVAL 2 DAY),  'hospitalise', 'Alix Girard',   '06 72 73 74 75');

INSERT INTO rendez_vous (reference, enfant_nom, enfant_age, parent_nom, email, telephone, service_id, medecin_id, date_rdv, heure, motif, statut, created_at) VALUES
('K7M2Q9A1', 'Léna Dumas',     7,  'Pauline Dumas',   'pauline.dumas@mail.fr',  '06 01 02 03 04', 3, 5,  DATE_SUB(CURDATE(), INTERVAL 13 DAY), '09:00', 'Souffle au cœur détecté par le pédiatre',       'termine',    DATE_SUB(NOW(), INTERVAL 20 DAY)),
('B3X8P2L5', 'Ilyes Saïdi',    4,  'Karima Saïdi',    'k.saidi@mail.fr',        '06 05 06 07 08', 7, 13, DATE_SUB(CURDATE(), INTERVAL 12 DAY), '10:30', 'Toux chronique nocturne',                       'termine',    DATE_SUB(NOW(), INTERVAL 18 DAY)),
('C9T4R6W2', 'Maëlys Petit',   11, 'Olivier Petit',   'o.petit@mail.fr',        '06 09 10 11 12', 6, 11, DATE_SUB(CURDATE(), INTERVAL 11 DAY), '14:00', 'Maux de tête fréquents',                         'termine',    DATE_SUB(NOW(), INTERVAL 17 DAY)),
('D2Y7U1I8', 'Evan Colin',     9,  'Sarah Colin',     's.colin@mail.fr',        '06 13 14 15 16', 4, 8,  DATE_SUB(CURDATE(), INTERVAL 10 DAY), '11:00', 'Contrôle après fracture du poignet',             'termine',    DATE_SUB(NOW(), INTERVAL 15 DAY)),
('E5O3P9A4', 'Romy Gauthier',  2,  'Aline Gauthier',  'a.gauthier@mail.fr',     '06 17 18 19 20', 7, 14, DATE_SUB(CURDATE(), INTERVAL 10 DAY), '15:30', 'Suspicion d''allergie à l''œuf',               'annule',     DATE_SUB(NOW(), INTERVAL 14 DAY)),
('F8S2D6F1', 'Timéo Bertrand', 14, 'Hélène Bertrand', 'h.bertrand@mail.fr',     '06 21 22 23 24', 8, 15, DATE_SUB(CURDATE(), INTERVAL 9 DAY),  '16:00', 'Anxiété scolaire',                               'termine',    DATE_SUB(NOW(), INTERVAL 13 DAY)),
('G1H5J8K3', 'Anna Morin',     6,  'Lucie Morin',     'l.morin@mail.fr',        '06 25 26 27 28', 3, 5,  DATE_SUB(CURDATE(), INTERVAL 8 DAY),  '09:30', 'Palpitations à l''effort',                      'termine',    DATE_SUB(NOW(), INTERVAL 12 DAY)),
('H4L7Z2X9', 'Nathan Roger',   12, 'David Roger',     'd.roger@mail.fr',        '06 29 30 31 32', 4, 7,  DATE_SUB(CURDATE(), INTERVAL 7 DAY),  '10:00', 'Consultation pré-opératoire appendicite',        'termine',    DATE_SUB(NOW(), INTERVAL 11 DAY)),
('J6C3V8B2', 'Elsa Lemoine',   5,  'Julia Lemoine',   'j.lemoine@mail.fr',      '06 33 34 35 36', 7, 13, DATE_SUB(CURDATE(), INTERVAL 7 DAY),  '11:30', 'Asthme — suivi trimestriel',                    'termine',    DATE_SUB(NOW(), INTERVAL 10 DAY)),
('K9N1M5Q7', 'Victor Arnaud',  3,  'Céline Arnaud',   'c.arnaud@mail.fr',       '06 37 38 39 40', 2, 4,  DATE_SUB(CURDATE(), INTERVAL 6 DAY),  '14:30', 'Suivi d''ancien prématuré',                     'termine',    DATE_SUB(NOW(), INTERVAL 10 DAY)),
('L2W8E4R6', 'Capucine Noël',  10, 'Simon Noël',      's.noel@mail.fr',         '06 41 42 43 44', 6, 12, DATE_SUB(CURDATE(), INTERVAL 5 DAY),  '09:00', 'Bilan de migraine',                              'termine',    DATE_SUB(NOW(), INTERVAL 9 DAY)),
('M5T9Y3U1', 'Raphaël Brun',   8,  'Agathe Brun',     'a.brun@mail.fr',         '06 45 46 47 48', 5, 9,  DATE_SUB(CURDATE(), INTERVAL 4 DAY),  '10:00', 'Contrôle sanguin',                               'termine',    DATE_SUB(NOW(), INTERVAL 8 DAY)),
('N8I2O6P4', 'Margaux Giraud', 15, 'Fabrice Giraud',  'f.giraud@mail.fr',       '06 49 50 51 52', 8, 16, DATE_SUB(CURDATE(), INTERVAL 3 DAY),  '15:00', 'Troubles du sommeil',                            'annule',     DATE_SUB(NOW(), INTERVAL 7 DAY)),
('P1A7S3D9', 'Sohan Mathieu',  6,  'Emma Mathieu',    'e.mathieu@mail.fr',      '06 53 54 55 56', 7, 14, DATE_SUB(CURDATE(), INTERVAL 2 DAY),  '11:00', 'Tests cutanés aux pollens',                      'termine',    DATE_SUB(NOW(), INTERVAL 6 DAY)),
('Q4F8G2H6', 'Louise Caron',   9,  'Antoine Caron',   'a.caron@mail.fr',        '06 57 58 59 60', 3, 5,  DATE_SUB(CURDATE(), INTERVAL 1 DAY),  '09:00', 'Échographie cardiaque de contrôle',              'termine',    DATE_SUB(NOW(), INTERVAL 5 DAY)),
('R7J1K5L3', 'Malo Fabre',     13, 'Sandrine Fabre',  's.fabre@mail.fr',        '06 61 62 63 64', 4, 8,  CURDATE(),                            '09:30', 'Douleurs au genou',                              'confirme',   DATE_SUB(NOW(), INTERVAL 4 DAY)),
('S2Z6X9C4', 'Lya Benard',     4,  'Thomas Benard',   't.benard@mail.fr',       '06 65 66 67 68', 7, 13, CURDATE(),                            '10:30', 'Bronchiolites à répétition',                     'confirme',   DATE_SUB(NOW(), INTERVAL 3 DAY)),
('T5V3B7N1', 'Ayden Collet',   7,  'Marion Collet',   'm.collet@mail.fr',       '06 69 70 71 72', 6, 11, CURDATE(),                            '14:00', 'Suivi épilepsie',                                'confirme',   DATE_SUB(NOW(), INTERVAL 3 DAY)),
('U8M4Q1W5', 'Iris Leclerc',   1,  'Pauline Leclerc', 'p.leclerc@mail.fr',      '06 73 74 75 76', 2, 3,  CURDATE(),                            '15:30', 'Contrôle de croissance',                         'en_attente', DATE_SUB(NOW(), INTERVAL 2 DAY)),
('V3E9R2T8', 'Oscar Meunier',  11, 'Jean Meunier',    'j.meunier@mail.fr',      '06 77 78 79 80', 5, 10, DATE_ADD(CURDATE(), INTERVAL 1 DAY),  '10:00', 'Consultation d''annonce et suivi',              'confirme',   DATE_SUB(NOW(), INTERVAL 2 DAY)),
('W6Y1U7I3', 'Céleste Boyer',  6,  'Nadia Boyer',     'n.boyer@mail.fr',        '06 81 82 83 84', 3, 5,  DATE_ADD(CURDATE(), INTERVAL 1 DAY),  '11:00', 'Souffle cardiaque',                              'en_attente', DATE_SUB(NOW(), INTERVAL 1 DAY)),
('X9O5P8A2', 'Noah Lacroix',   8,  'Sophie Lacroix',  's.lacroix@mail.fr',      '06 85 86 87 88', 4, 7,  DATE_ADD(CURDATE(), INTERVAL 2 DAY),  '09:00', 'Hernie inguinale',                               'confirme',   DATE_SUB(NOW(), INTERVAL 1 DAY)),
('Y2S6D3F7', 'Alma Rey',       12, 'Kevin Rey',       'k.rey@mail.fr',          '06 89 90 91 92', 8, 15, DATE_ADD(CURDATE(), INTERVAL 2 DAY),  '16:00', 'Troubles alimentaires',                          'en_attente', DATE_SUB(NOW(), INTERVAL 20 HOUR)),
('Z5G9H4J1', 'Milo Schmitt',   3,  'Laura Schmitt',   'l.schmitt@mail.fr',      '06 93 94 95 96', 7, 14, DATE_ADD(CURDATE(), INTERVAL 3 DAY),  '10:30', 'Allergie aux arachides',                         'en_attente', DATE_SUB(NOW(), INTERVAL 15 HOUR)),
('A8K2L6Z4', 'Jeanne Robin',   9,  'Pierre Robin',    'p.robin@mail.fr',        '06 97 98 99 00', 6, 12, DATE_ADD(CURDATE(), INTERVAL 4 DAY),  '14:30', 'Tics moteurs',                                   'en_attente', DATE_SUB(NOW(), INTERVAL 10 HOUR)),
('B1X5C9V3', 'Isaac Marchand', 14, 'Elodie Marchand', 'e.marchand@mail.fr',     '06 10 20 30 40', 3, 5,  DATE_ADD(CURDATE(), INTERVAL 5 DAY),  '09:30', 'Certificat sport — ECG',                         'confirme',   DATE_SUB(NOW(), INTERVAL 8 HOUR)),
('C4B8N2M6', 'Agathe Lucas',   5,  'Marc Lucas',      'm.lucas@mail.fr',        '06 50 60 70 80', 4, 8,  DATE_ADD(CURDATE(), INTERVAL 6 DAY),  '11:30', 'Pieds plats',                                    'en_attente', DATE_SUB(NOW(), INTERVAL 5 HOUR)),
('D7Q1W5E9', 'Basile Aubert',  2,  'Chloé Aubert',    'c.aubert@mail.fr',       '06 15 25 35 45', 2, 4,  DATE_ADD(CURDATE(), INTERVAL 7 DAY),  '10:00', 'Suivi néonatal',                                 'en_attente', DATE_SUB(NOW(), INTERVAL 2 HOUR));

INSERT INTO actualites (slug, titre, resume, contenu, categorie, emoji, couleur, date_pub) VALUES
('nouvelle-salle-de-jeux', 'Une toute nouvelle salle de jeux au 3e étage !',
 'Grâce à vos dons, la salle de jeux du service de chirurgie a fait peau neuve : toboggan, mur d''escalade et coin lecture.',
 'Après six mois de travaux, la nouvelle salle de jeux du service de chirurgie pédiatrique a ouvert ses portes. Imaginée avec les enfants eux-mêmes lors d''ateliers de dessin, elle propose un toboggan intérieur, un mur d''escalade adapté, des consoles et un grand coin lecture en forme de baleine.\n\nCe projet a été entièrement financé par la générosité de plus de 1 200 donateurs. Un immense merci à toutes et à tous !\n\nLa salle est ouverte tous les jours de 9h à 19h, en présence d''une animatrice.',
 'Vie de l''hôpital', '🛝', 'amber', DATE_SUB(CURDATE(), INTERVAL 2 DAY)),
('chiens-assistance', 'Pepper et Biscuit, nos chiens d''assistance, fêtent leur 1 an',
 'Depuis un an, deux golden retrievers apportent réconfort et sourires aux enfants hospitalisés.',
 'Pepper et Biscuit sont arrivés à l''hôpital il y a un an, en partenariat avec l''association Handi''Chiens. Chaque mercredi, ils rendent visite aux enfants hospitalisés en pédopsychiatrie, en oncologie et en neurologie.\n\nLes études montrent que la médiation animale diminue l''anxiété et la perception de la douleur. Les équipes soignantes constatent chaque semaine son effet apaisant.\n\nPour fêter cet anniversaire, un goûter canin (et humain !) a été organisé dans le jardin thérapeutique.',
 'Bien-être', '🐕', 'emerald', DATE_SUB(CURDATE(), INTERVAL 6 DAY)),
('robot-chirurgical', 'Un robot chirurgical dédié aux enfants',
 'Le bloc pédiatrique s''équipe d''un robot de dernière génération pour des interventions moins invasives.',
 'Le service de chirurgie pédiatrique dispose désormais d''un robot chirurgical adapté à la morphologie des enfants. Les incisions sont plus petites, la douleur post-opératoire réduite et la durée d''hospitalisation raccourcie.\n\nLe Pr Amélie Rousseau et son équipe ont été formés pendant plusieurs mois. Les premières interventions se sont parfaitement déroulées.',
 'Innovation', '🤖', 'sky', DATE_SUB(CURDATE(), INTERVAL 12 DAY)),
('course-solidaire', 'Course solidaire : 42 000 € récoltés !',
 'Plus de 800 coureurs se sont mobilisés pour financer la recherche contre les cancers de l''enfant.',
 'La 5e édition de la Course des Petits Héros a réuni 812 participants, petits et grands, sous un soleil radieux. Les fonds récoltés, 42 000 €, seront entièrement reversés au programme de recherche du service d''hémato-oncologie.\n\nRendez-vous l''année prochaine pour battre ce record !',
 'Solidarité', '🏃', 'rose', DATE_SUB(CURDATE(), INTERVAL 20 DAY)),
('ecole-asthme', 'L''école de l''asthme ouvre de nouvelles sessions',
 'Des ateliers ludiques pour apprendre à vivre avec l''asthme, dès 4 ans, avec les parents.',
 'L''école de l''asthme du service de pneumo-allergologie propose de nouvelles sessions chaque mois. Au programme : comprendre ses bronches avec des ballons, apprendre à utiliser sa chambre d''inhalation et reconnaître les signes d''une crise.\n\nInscriptions auprès du secrétariat du service.',
 'Prévention', '🌬️', 'teal', DATE_SUB(CURDATE(), INTERVAL 27 DAY)),
('concert-chorale', 'La chorale des couloirs en concert',
 'Les enfants hospitalisés ont offert un concert émouvant aux familles et aux soignants.',
 'Après des semaines de répétitions avec Jules, notre musicothérapeute, la Chorale des couloirs a donné son grand concert dans l''auditorium. Au programme : chansons de dessins animés, comptines revisitées et un final repris en chœur par toute la salle.\n\nUne vidéo est disponible sur demande auprès de l''équipe d''animation.',
 'Activités', '🎶', 'violet', DATE_SUB(CURDATE(), INTERVAL 35 DAY));

INSERT INTO temoignages (auteur, role, texte, note, avatar) VALUES
('Sarah, maman de Lina', 'Chirurgie pédiatrique', 'Lina avait tellement peur de l''opération… Elle est partie au bloc dans une petite voiture rouge en rigolant. Merci à toute l''équipe pour tant de douceur.', 5, '👩'),
('Karim, papa de Yanis', 'Néonatologie', 'Six semaines en néonatologie, et à aucun moment nous ne nous sommes sentis seuls. Les puéricultrices sont devenues notre deuxième famille.', 5, '👨'),
('Tom, 9 ans', 'Pneumo-allergologie', 'L''école de l''asthme c''était trop bien ! Maintenant je sais utiliser mon inhalateur tout seul et je peux refaire du foot.', 5, '🧒'),
('Manon, 15 ans', 'Hémato-oncologie', 'Les tournois de jeux vidéo du mercredi et les profs de l''école à l''hôpital m''ont aidée à tenir pendant mon traitement.', 5, '👧'),
('Julie, maman de Noé', 'Urgences pédiatriques', 'Arrivés à 3h du matin, pris en charge très vite. Le médecin a fait des tours de magie à Noé pendant la suture. Incroyable.', 5, '👩'),
('Paul, papa de Sacha', 'Hémato-oncologie', 'Une équipe humaine, disponible, qui prend le temps d''expliquer. Les docteurs clowns ont illuminé nos journées.', 5, '👨');

INSERT INTO messages (nom, email, sujet, message, lu, created_at) VALUES
('Aurélie Martin', 'aurelie.m@mail.fr', 'Horaires de visite', 'Bonjour, les grands-parents peuvent-ils venir en dehors des horaires de visite le week-end ? Merci.', 0, DATE_SUB(NOW(), INTERVAL 3 HOUR)),
('Bruno Leduc', 'b.leduc@mail.fr', 'Bénévolat', 'Je suis musicien et j''aimerais proposer des concerts bénévoles pour les enfants. Qui contacter ?', 0, DATE_SUB(NOW(), INTERVAL 1 DAY)),
('Fatima Zahra', 'f.zahra@mail.fr', 'Remerciements', 'Un immense merci à l''équipe de néonatologie pour la prise en charge de notre fille Inaya.', 1, DATE_SUB(NOW(), INTERVAL 3 DAY)),
('Club de foot de Vitry', 'contact@fcvitry.fr', 'Collecte de jouets', 'Nous organisons une collecte de jouets pour Noël, comment pouvons-nous vous les remettre ?', 1, DATE_SUB(NOW(), INTERVAL 6 DAY));

INSERT INTO dons (nom, email, montant, projet, message, created_at) VALUES
('Famille Robert', 'robert@mail.fr', 150.00, 'salle-jeux', 'Merci pour Lina !', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(NULL, NULL, 50.00, 'recherche', NULL, DATE_SUB(NOW(), INTERVAL 2 DAY)),
('Entreprise Soleil', 'contact@soleil.fr', 2500.00, 'recherche', 'Pour la recherche contre les cancers de l''enfant.', DATE_SUB(NOW(), INTERVAL 4 DAY)),
('Marc B.', 'marc.b@mail.fr', 30.00, 'clowns', 'Les clowns sont formidables', DATE_SUB(NOW(), INTERVAL 5 DAY)),
('Association Les Copains', NULL, 800.00, 'salle-jeux', NULL, DATE_SUB(NOW(), INTERVAL 8 DAY)),
(NULL, NULL, 20.00, 'clowns', NULL, DATE_SUB(NOW(), INTERVAL 9 DAY)),
('Sophie T.', 'sophie.t@mail.fr', 100.00, 'maison-parents', 'Courage aux familles', DATE_SUB(NOW(), INTERVAL 12 DAY)),
('Lycée Jean Moulin', NULL, 1240.00, 'recherche', 'Fruit de notre course solidaire', DATE_SUB(NOW(), INTERVAL 15 DAY)),
(NULL, NULL, 75.00, 'maison-parents', NULL, DATE_SUB(NOW(), INTERVAL 18 DAY)),
('Pierre & Anne', 'pa@mail.fr', 200.00, 'salle-jeux', NULL, DATE_SUB(NOW(), INTERVAL 22 DAY));
