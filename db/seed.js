const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { pool, query } = require('../db');

const SEED_PASSWORD = process.env.SEED_PASSWORD || 'password123';

const USERS = [
  {
    username: 'marcos',
    name: 'Marcos Gomes',
    email: 'marcos@portal.local',
    github_profile: 'https://github.com/Maky189',
    repos: [
      ['AngularTodoList', 'https://github.com/Maky189/AngularTodoList', 'A project learning Typescript and Angular Js'],
      ['API-monolitica', 'https://github.com/Maky189/API-monolitica', ''],
      ['Banco-xpto', 'https://github.com/Maky189/Banco-xpto', 'A simple implementation of a xpto bank in pure C'],
      ['Base_de_dados-Sistema-De-Gestao', 'https://github.com/Maky189/Base_de_dados-Sistema-De-Gestao', 'Simples Implementacao de um SGB'],
      ['Biblioteca-Django_version', 'https://github.com/Maky189/Biblioteca-Django_version', 'The implementation of the Biblioteca app, now in django'],
      ['Biblioteca-Flask-version', 'https://github.com/Maky189/Biblioteca-Flask-version', 'Gerenciador Biblioteca'],
      ['Chess_Game_IA', 'https://github.com/Maky189/Chess_Game_IA', 'An Artificial Inteligence Chess bot made by me'],
      ['Computacao_Grafica', 'https://github.com/Maky189/Computacao_Grafica', 'The assignments of my class'],
      ['Converter_glb_to_j3o_', 'https://github.com/Maky189/Converter_glb_to_j3o_', 'Convertor from glb to j3o for Blender to Jme3'],
      ['CS-188-Summer-2025-Project-0', 'https://github.com/Maky189/CS-188-Summer-2025-Project-0', 'Solution for project 0 of CS188'],
      ['CS188-Multi-Agent-Search-', 'https://github.com/Maky189/CS188-Multi-Agent-Search-', 'The project 2 of CS188'],
      ['CS188-Pacman', 'https://github.com/Maky189/CS188-Pacman', 'The project 1 of CS188, pacman agent'],
      ['CS188-Reinforcement', 'https://github.com/Maky189/CS188-Reinforcement', 'Project 3 of CS188 2025 Princeton'],
      ['CS188-Tracking', 'https://github.com/Maky189/CS188-Tracking', 'The project 4 of CS188'],
      ['Flex-Scanner-of-Shop_Logs', 'https://github.com/Maky189/Flex-Scanner-of-Shop_Logs', 'A scanner made in flex for logs of shops online'],
      ['GameVision-AI-Visual-Concept-System', 'https://github.com/Maky189/GameVision-AI-Visual-Concept-System', 'AI-Based Visual Concept Assistant for Game Development'],
      ['GeoCaboVerde', 'https://github.com/Maky189/GeoCaboVerde', 'Sistema de localizacoes de Cabo Verde'],
      ['Gerenciador-Biblioteca', 'https://github.com/Maky189/Gerenciador-Biblioteca', 'Um simples gerenciador de Biblioteca em Java'],
      ['Gerenciador-de-metas', 'https://github.com/Maky189/Gerenciador-de-metas', 'Simple app gerenciamneto de metas'],
      ['Gestor-Financeiro-Backend', 'https://github.com/Maky189/Gestor-Financeiro-Backend', ''],
      ['Gestor-Financeiro-Frontend', 'https://github.com/Maky189/Gestor-Financeiro-Frontend', ''],
      ['Image_Converter_Filter', 'https://github.com/Maky189/Image_Converter_Filter', 'A simple Image JPG converter with filters'],
      ['Jantar-de-Filosofos', 'https://github.com/Maky189/Jantar-de-Filosofos', 'Philosophers problem in Java Concurrent Programming'],
      ['LZW_Text_Compressor', 'https://github.com/Maky189/LZW_Text_Compressor', 'Python converter of text using the LZW algorithm'],
      ['Magic6', 'https://github.com/Maky189/Magic6', 'Simples jogo de advinhacao Magic6 em C'],
      ['Medical_AttendanceApp_API', 'https://github.com/Maky189/Medical_AttendanceApp_API', 'The API of my Medical attendance app'],
      ['MinecraftConsoles', 'https://github.com/Maky189/MinecraftConsoles', 'A certain block game'],
      ['Monolith_API', 'https://github.com/Maky189/Monolith_API', 'Web-based management platform for the Outland game engine team.'],
      ['municipalities-of-cape-verde', 'https://github.com/Maky189/municipalities-of-cape-verde', 'API with all municipalities, zones and streets of Cape Verde'],
      ['Music-Streamer', 'https://github.com/Maky189/Music-Streamer', 'A simple Music Streaming for practice of databases'],
      ['My_Task_Manager', 'https://github.com/Maky189/My_Task_Manager', 'task manager for unix systems'],
      ['Notas_API', 'https://github.com/Maky189/Notas_API', 'Um simples API em express.js'],
      ['OpenGL-Triangle', 'https://github.com/Maky189/OpenGL-Triangle', 'Intro to OpenGL by building a triangle'],
      ['Pacman_C', 'https://github.com/Maky189/Pacman_C', 'Simple pacman in C'],
      ['Portal-de-Projetos-de-Estudantes-Universitarios', 'https://github.com/Maky189/Portal-de-Projetos-de-Estudantes-Universitarios', 'Portal web da Universidade do Mindelo'],
      ['Programming-in-Haskell', 'https://github.com/Maky189/Programming-in-Haskell', 'Coverage of the functional programming class'],
      ['Raycaster-Engine', 'https://github.com/Maky189/Raycaster-Engine', 'A minimal raycaster written in C with OpenGL'],
      ['Reversi', 'https://github.com/Maky189/Reversi', 'Final project of the 1st semester'],
      ['SimplePageImagesofGames', 'https://github.com/Maky189/SimplePageImagesofGames', 'HTML, CSS and JS work done in class'],
      ['Stack_Implementation', 'https://github.com/Maky189/Stack_Implementation', 'Stack implementation for Computer Systems Programming'],
      ['Tictactoe', 'https://github.com/Maky189/Tictactoe', 'My first AI project'],
      ['Youtube_Downloader', 'https://github.com/Maky189/Youtube_Downloader', 'youtube video downloader using pytube'],
      ['ZipConversor', 'https://github.com/Maky189/ZipConversor', 'A Gui conversor in C++'],
    ],
  },
  {
    username: 'leonardo',
    name: 'Leonardo Dionisio',
    email: 'leonardo@portal.local',
    github_profile: 'https://github.com/Leoxznn',
    repos: [
      ['Analisador-lexico-', 'https://github.com/Leoxznn/Analisador-lexico-', 'Implementacao de analisador lexico em c.'],
      ['API-monolitica', 'https://github.com/Leoxznn/API-monolitica', ''],
      ['Centro_Estagio', 'https://github.com/Leoxznn/Centro_Estagio', 'Ficha 6 Programacao Concorrente'],
      ['Controlo_Biblioteca', 'https://github.com/Leoxznn/Controlo_Biblioteca', 'Ficha 8 Programacao Concorrente'],
      ['cs188-project-1', 'https://github.com/Leoxznn/cs188-project-1', ''],
      ['Docentes', 'https://github.com/Leoxznn/Docentes', 'Ficha 5 Programacao Concorrente'],
      ['E-commerce', 'https://github.com/Leoxznn/E-commerce', 'Ficha 2 Programacao Concorrente'],
      ['FicheirosLog', 'https://github.com/Leoxznn/FicheirosLog', 'Ficha 1 Programacao Concorrente'],
      ['Gerador_relatorio', 'https://github.com/Leoxznn/Gerador_relatorio', 'Ficha 7 Programacao Concorrente'],
      ['Gest-o-base-dados', 'https://github.com/Leoxznn/Gest-o-base-dados', ''],
      ['Jantar_Filosofos', 'https://github.com/Leoxznn/Jantar_Filosofos', 'Philosophers Dinner implementation in java'],
      ['Portal-de-Projetos-de-Estudantes-Universitarios', 'https://github.com/Leoxznn/Portal-de-Projetos-de-Estudantes-Universitarios', 'Portal web da Universidade do Mindelo'],
      ['Processador_Notas', 'https://github.com/Leoxznn/Processador_Notas', 'Processador de notas de alunos'],
      ['Reversi', 'https://github.com/Leoxznn/Reversi', 'Final project of the 1st semester'],
      ['Stack-C', 'https://github.com/Leoxznn/Stack-C', 'A Stack implemented in C language.'],
    ],
  },
];

async function init() {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  await query(schema);

  const { rows } = await query('SELECT COUNT(*)::int AS n FROM users');
  if (rows[0].n > 0) {
    console.log('[seed] users already present, skipping seed');
    return;
  }

  const hash = await bcrypt.hash(SEED_PASSWORD, 10);

  for (const u of USERS) {
    const res = await query(
      `INSERT INTO users (username, name, email, password_hash, github_profile)
       VALUES ($1,$2,$3,$4,$5) RETURNING id`,
      [u.username, u.name, u.email, hash, u.github_profile],
    );
    const userId = res.rows[0].id;
    for (const [title, url, desc] of u.repos) {
      await query(
        `INSERT INTO projects (user_id, title, description, github_url)
         VALUES ($1,$2,$3,$4)`,
        [userId, title, desc, url],
      );
    }
    console.log(`[seed] inserted ${u.username} with ${u.repos.length} projects`);
  }
}

async function run() {
  try {
    await init();
  } catch (err) {
    console.error('[seed] failed:', err.message);
    throw err;
  }
}

if (require.main === module) {
  run().then(() => pool.end());
} else {
  module.exports = { run };
}
