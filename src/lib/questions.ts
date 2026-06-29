// Banco de preguntas para Trivials Wars
// 60 preguntas (10 por categoría) variando dificultades
// UUIDs únicos por pregunta

import { randomUUID } from "crypto"

export interface QuestionSeed {
  uuid: string
  category: string
  question: string
  options: [string, string, string, string]
  correctAnswer: string
  difficulty: "Facil" | "Medio" | "Dificil" | "Experto"
}

const RAW_QUESTIONS: Omit<QuestionSeed, "uuid">[] = [
  // ===== ENTRETENIMIENTO =====
  {
    category: "Entretenimiento",
    difficulty: "Facil",
    question: "¿Quién dirigió la película 'Titanic' de 1997?",
    options: ["Steven Spielberg", "James Cameron", "Christopher Nolan", "Martin Scorsese"],
    correctAnswer: "James Cameron",
  },
  {
    category: "Entretenimiento",
    difficulty: "Facil",
    question: "¿Cuál es el nombre del mago protagonista de la saga de J.K. Rowling?",
    options: ["Frodo Bolson", "Harry Potter", "Percy Jackson", "Ron Weasley"],
    correctAnswer: "Harry Potter",
  },
  {
    category: "Entretenimiento",
    difficulty: "Facil",
    question: "¿Qué color es la almohada de SpongeBob?",
    options: ["Azul", "Verde", "Roja", "Amarilla"],
    correctAnswer: "Roja",
  },
  {
    category: "Entretenimiento",
    difficulty: "Medio",
    question: "¿En qué año se estrenó el primer film de 'Star Wars: Una nueva esperanza'?",
    options: ["1975", "1977", "1980", "1983"],
    correctAnswer: "1977",
  },
  {
    category: "Entretenimiento",
    difficulty: "Medio",
    question: "¿Quién interpretó a Jack Sparrow en 'Piratas del Caribe'?",
    options: ["Orlando Bloom", "Johnny Depp", "Brad Pitt", "Tom Hanks"],
    correctAnswer: "Johnny Depp",
  },
  {
    category: "Entretenimiento",
    difficulty: "Medio",
    question: "¿Cuál es la película más taquillera de la historia (a 2023)?",
    options: ["Titanic", "Avengers: Endgame", "Avatar", "Star Wars VII"],
    correctAnswer: "Avatar",
  },
  {
    category: "Entretenimiento",
    difficulty: "Dificil",
    question: "¿Qué director ganó el Oscar a Mejor Director por 'La Forma del Agua' (2017)?",
    options: ["Christopher Nolan", "Guillermo del Toro", "Alejandro González Iñárritu", "Alfonso Cuarón"],
    correctAnswer: "Guillermo del Toro",
  },
  {
    category: "Entretenimiento",
    difficulty: "Dificil",
    question: "¿Cuál fue el primer largometraje de Pixar?",
    options: ["Bichos", "Toy Story", "Monsters Inc.", "Buscando a Nemo"],
    correctAnswer: "Toy Story",
  },
  {
    category: "Entretenimiento",
    difficulty: "Experto",
    question: "¿En qué año se estrenó 'Ciudadano Kane' de Orson Welles?",
    options: ["1939", "1941", "1945", "1950"],
    correctAnswer: "1941",
  },
  {
    category: "Entretenimiento",
    difficulty: "Experto",
    question: "¿Qué actor ha interpretado a James Bond más veces en películas oficiales EON?",
    options: ["Sean Connery", "Pierce Brosnan", "Roger Moore", "Daniel Craig"],
    correctAnswer: "Roger Moore",
  },

  // ===== DEPORTE =====
  {
    category: "Deporte",
    difficulty: "Facil",
    question: "¿Cuántos jugadores tiene un equipo de fútbol en el campo?",
    options: ["9", "10", "11", "12"],
    correctAnswer: "11",
  },
  {
    category: "Deporte",
    difficulty: "Facil",
    question: "¿En qué deporte se usa una raqueta y una pelota amarilla?",
    options: ["Tenis", "Golf", "Bádminton", "Ping Pong"],
    correctAnswer: "Tenis",
  },
  {
    category: "Deporte",
    difficulty: "Facil",
    question: "¿Cada cuántos años se celebran los Juegos Olímpicos de verano?",
    options: ["2 años", "3 años", "4 años", "5 años"],
    correctAnswer: "4 años",
  },
  {
    category: "Deporte",
    difficulty: "Medio",
    question: "¿Quién es el máximo goleador histórico de la selección argentina?",
    options: ["Diego Maradona", "Gabriel Batistuta", "Lionel Messi", "Sergio Agüero"],
    correctAnswer: "Lionel Messi",
  },
  {
    category: "Deporte",
    difficulty: "Medio",
    question: "¿En qué país se originó el arte marcial del Judo?",
    options: ["China", "Japón", "Corea", "Brasil"],
    correctAnswer: "Japón",
  },
  {
    category: "Deporte",
    difficulty: "Medio",
    question: "¿Cuántos puntos vale un triple en baloncesto?",
    options: ["2", "3", "4", "5"],
    correctAnswer: "3",
  },
  {
    category: "Deporte",
    difficulty: "Dificil",
    question: "¿Qué piloto ha ganado más campeonatos de Fórmula 1?",
    options: ["Ayrton Senna", "Michael Schumacher", "Lewis Hamilton", "Sebastian Vettel"],
    correctAnswer: "Lewis Hamilton",
  },
  {
    category: "Deporte",
    difficulty: "Dificil",
    question: "¿En qué año se jugó el primer Mundial de Fútbol?",
    options: ["1924", "1930", "1934", "1938"],
    correctAnswer: "1930",
  },
  {
    category: "Deporte",
    difficulty: "Experto",
    question: "¿Qué equipo ha ganado más Copas Stanley en la NHL?",
    options: ["Toronto Maple Leafs", "Detroit Red Wings", "Montreal Canadiens", "Boston Bruins"],
    correctAnswer: "Montreal Canadiens",
  },
  {
    category: "Deporte",
    difficulty: "Experto",
    question: "¿Quién ostenta el récord mundial de los 100m lisos masculinos?",
    options: ["Tyson Gay", "Yohan Blake", "Usain Bolt", "Justin Gatlin"],
    correctAnswer: "Usain Bolt",
  },

  // ===== HISTORIA =====
  {
    category: "Historia",
    difficulty: "Facil",
    question: "¿En qué año llegó Cristóbal Colón a América?",
    options: ["1488", "1492", "1500", "1510"],
    correctAnswer: "1492",
  },
  {
    category: "Historia",
    difficulty: "Facil",
    question: "¿Qué civilización construyó Machu Picchu?",
    options: ["Aztecas", "Mayas", "Incas", "Olmecas"],
    correctAnswer: "Incas",
  },
  {
    category: "Historia",
    difficulty: "Facil",
    question: "¿Quién fue el primer presidente de Estados Unidos?",
    options: ["Thomas Jefferson", "Abraham Lincoln", "George Washington", "John Adams"],
    correctAnswer: "George Washington",
  },
  {
    category: "Historia",
    difficulty: "Medio",
    question: "¿En qué año cayó el Muro de Berlín?",
    options: ["1987", "1989", "1991", "1993"],
    correctAnswer: "1989",
  },
  {
    category: "Historia",
    difficulty: "Medio",
    question: "¿Qué imperio construyó el Coliseo Romano?",
    options: ["Imperio Griego", "Imperio Romano", "Imperio Bizantino", "Imperio Otomano"],
    correctAnswer: "Imperio Romano",
  },
  {
    category: "Historia",
    difficulty: "Medio",
    question: "¿Quién pintó la Capilla Sixtina?",
    options: ["Leonardo da Vinci", "Rafael", "Miguel Ángel", "Donatello"],
    correctAnswer: "Miguel Ángel",
  },
  {
    category: "Historia",
    difficulty: "Dificil",
    question: "¿En qué año comenzó la Revolución Francesa?",
    options: ["1776", "1789", "1799", "1804"],
    correctAnswer: "1789",
  },
  {
    category: "Historia",
    difficulty: "Dificil",
    question: "¿Qué faraón egipcio es conocido por su tumba descubierta en 1922?",
    options: ["Ramsés II", "Tutankamón", "Cleopatra", "Akhenatón"],
    correctAnswer: "Tutankamón",
  },
  {
    category: "Historia",
    difficulty: "Experto",
    question: "¿Quién fue el último emperador del Imperio Bizantino?",
    options: ["Justiniano I", "Constantino XI", "Basilio II", "Alejo I"],
    correctAnswer: "Constantino XI",
  },
  {
    category: "Historia",
    difficulty: "Experto",
    question: "¿En qué año se firmó la Magna Carta en Inglaterra?",
    options: ["1099", "1215", "1295", "1346"],
    correctAnswer: "1215",
  },

  // ===== MATEMÁTICAS =====
  {
    category: "Matematicas",
    difficulty: "Facil",
    question: "¿Cuánto es 7 × 8?",
    options: ["54", "56", "58", "64"],
    correctAnswer: "56",
  },
  {
    category: "Matematicas",
    difficulty: "Facil",
    question: "¿Cuál es la raíz cuadrada de 144?",
    options: ["10", "11", "12", "13"],
    correctAnswer: "12",
  },
  {
    category: "Matematicas",
    difficulty: "Facil",
    question: "¿Cuántos lados tiene un hexágono?",
    options: ["5", "6", "7", "8"],
    correctAnswer: "6",
  },
  {
    category: "Matematicas",
    difficulty: "Medio",
    question: "¿Cuánto es 15% de 200?",
    options: ["25", "30", "35", "40"],
    correctAnswer: "30",
  },
  {
    category: "Matematicas",
    difficulty: "Medio",
    question: "Si un triángulo tiene ángulos de 60° y 80°, ¿cuánto mide el tercer ángulo?",
    options: ["30°", "40°", "50°", "60°"],
    correctAnswer: "40°",
  },
  {
    category: "Matematicas",
    difficulty: "Medio",
    question: "¿Cuál es el resultado de 2³ + 3²?",
    options: ["13", "15", "17", "19"],
    correctAnswer: "17",
  },
  {
    category: "Matematicas",
    difficulty: "Dificil",
    question: "¿Cuál es el valor de π (pi) aproximado a dos decimales?",
    options: ["3.12", "3.14", "3.16", "3.18"],
    correctAnswer: "3.14",
  },
  {
    category: "Matematicas",
    difficulty: "Dificil",
    question: "¿Cuál es el logaritmo en base 10 de 1000?",
    options: ["2", "3", "10", "100"],
    correctAnswer: "3",
  },
  {
    category: "Matematicas",
    difficulty: "Experto",
    question: "¿Cuál es el séptimo número de la sucesión de Fibonacci?",
    options: ["8", "13", "21", "34"],
    correctAnswer: "13",
  },
  {
    category: "Matematicas",
    difficulty: "Experto",
    question: "¿Cuál es la derivada de f(x) = 3x²?",
    options: ["3x", "6x", "6x²", "x²"],
    correctAnswer: "6x",
  },

  // ===== CIENCIA =====
  {
    category: "Ciencia",
    difficulty: "Facil",
    question: "¿Cuál es el planeta más grande del Sistema Solar?",
    options: ["Saturno", "Júpiter", "Neptuno", "Tierra"],
    correctAnswer: "Júpiter",
  },
  {
    category: "Ciencia",
    difficulty: "Facil",
    question: "¿Cuál es el símbolo químico del agua?",
    options: ["CO2", "H2O", "O2", "NaCl"],
    correctAnswer: "H2O",
  },
  {
    category: "Ciencia",
    difficulty: "Facil",
    question: "¿Cuántos huesos tiene el cuerpo humano adulto?",
    options: ["186", "206", "226", "246"],
    correctAnswer: "206",
  },
  {
    category: "Ciencia",
    difficulty: "Medio",
    question: "¿Qué científico propuso la Teoría de la Relatividad?",
    options: ["Isaac Newton", "Albert Einstein", "Niels Bohr", "Stephen Hawking"],
    correctAnswer: "Albert Einstein",
  },
  {
    category: "Ciencia",
    difficulty: "Medio",
    question: "¿Cuál es el gas más abundante en la atmósfera terrestre?",
    options: ["Oxígeno", "Nitrógeno", "Dióxido de carbono", "Hidrógeno"],
    correctAnswer: "Nitrógeno",
  },
  {
    category: "Ciencia",
    difficulty: "Medio",
    question: "¿Qué órgano produce insulina en el cuerpo humano?",
    options: ["Hígado", "Páncreas", "Riñones", "Tiroides"],
    correctAnswer: "Páncreas",
  },
  {
    category: "Ciencia",
    difficulty: "Dificil",
    question: "¿Cuál es la velocidad de la luz en el vacío (aproximada)?",
    options: ["300.000 km/s", "150.000 km/s", "1.000.000 km/s", "30.000 km/s"],
    correctAnswer: "300.000 km/s",
  },
  {
    category: "Ciencia",
    difficulty: "Dificil",
    question: "¿Qué partícula subatómica tiene carga negativa?",
    options: ["Protón", "Neutrón", "Electrón", "Positrón"],
    correctAnswer: "Electrón",
  },
  {
    category: "Ciencia",
    difficulty: "Experto",
    question: "¿Cuál es el elemento más abundante en el universo?",
    options: ["Helio", "Hidrógeno", "Oxígeno", "Carbono"],
    correctAnswer: "Hidrógeno",
  },
  {
    category: "Ciencia",
    difficulty: "Experto",
    question: "¿Cuál es el nombre del proceso por el cual las plantas convierten luz en energía?",
    options: ["Respiración", "Fotosíntesis", "Transpiración", "Digestión"],
    correctAnswer: "Fotosíntesis",
  },

  // ===== VIDEOJUEGOS =====
  {
    category: "Videojuegos",
    difficulty: "Facil",
    question: "¿Cuál es el personaje principal de la saga 'The Legend of Zelda'?",
    options: ["Zelda", "Link", "Ganon", "Sheik"],
    correctAnswer: "Link",
  },
  {
    category: "Videojuegos",
    difficulty: "Facil",
    question: "¿En qué videojuego aparecen los Blobs?",
    options: ["Among Us", "Fall Guys", "Minecraft", "Roblox"],
    correctAnswer: "Among Us",
  },
  {
    category: "Videojuegos",
    difficulty: "Facil",
    question: "¿Quién es el mascota más famosa de Nintendo?",
    options: ["Sonic", "Mario", "Pac-Man", "Crash Bandicoot"],
    correctAnswer: "Mario",
  },
  {
    category: "Videojuegos",
    difficulty: "Medio",
    question: "¿En qué año se lanzó 'Minecraft' (versión completa)?",
    options: ["2009", "2011", "2013", "2015"],
    correctAnswer: "2011",
  },
  {
    category: "Videojuegos",
    difficulty: "Medio",
    question: "¿Cuál es el juego más vendido de todos los tiempos?",
    options: ["Tetris", "GTA V", "Minecraft", "Wii Sports"],
    correctAnswer: "Minecraft",
  },
  {
    category: "Videojuegos",
    difficulty: "Medio",
    question: "¿Qué empresa desarrolló 'The Witcher 3: Wild Hunt'?",
    options: ["Bethesda", "CD Projekt Red", "BioWare", "Ubisoft"],
    correctAnswer: "CD Projekt Red",
  },
  {
    category: "Videojuegos",
    difficulty: "Dificil",
    question: "¿Quién creó la franquicia 'Final Fantasy'?",
    options: ["Hironobu Sakaguchi", "Shigeru Miyamoto", "Hideo Kojima", "Yu Suzuki"],
    correctAnswer: "Hironobu Sakaguchi",
  },
  {
    category: "Videojuegos",
    difficulty: "Dificil",
    question: "¿En qué año se lanzó el primer juego de la saga 'Pokémon' en Japón?",
    options: ["1994", "1996", "1998", "2000"],
    correctAnswer: "1996",
  },
  {
    category: "Videojuegos",
    difficulty: "Experto",
    question: "¿Cuál fue el primer juego arcade de Nintendo con éxito mundial (1981)?",
    options: ["Pac-Man", "Donkey Kong", "Space Invaders", "Galaga"],
    correctAnswer: "Donkey Kong",
  },
  {
    category: "Videojuegos",
    difficulty: "Experto",
    question: "¿En qué año se lanzó 'The Elder Scrolls V: Skyrim'?",
    options: ["2009", "2011", "2013", "2015"],
    correctAnswer: "2011",
  },
]

export const QUESTIONS_SEED: QuestionSeed[] = RAW_QUESTIONS.map((q) => ({
  ...q,
  uuid: randomUUID(),
}))
