
import { GridItem, UserProfile } from './types';

export const INITIAL_PROFILE: UserProfile = {
  name: "Robinho",
  role: "Social Manager • Filmmaker",
  avatar: "https://lh3.googleusercontent.com/d/1zA-juipd9qjJ8ljmZ5-CHpJBczzXabfM",
  email: "robsonjeffersonrocha@gmail.com",
  instagram: "rjefferxz",
  whatsapp: "5511999999999",
  whatsappMessage: "Oi!\nCheguei pelo seu link no Instagram e quero contratar seus serviços de comunicação/social media.\nMe conta como funciona?",
  driveLink: "https://drive.google.com/drive/folders/1ohAfJ_aybS5bA4FiLDv_MHZtxeC7s3sT?usp=drive_link"
};

export const INITIAL_ITEMS: GridItem[] = [
  {
    id: '1',
    type: 'social',
    title: 'Instagram',
    subtitle: 'Social Media Management',
    url: 'https://www.instagram.com/rjefferxz/',
    colSpan: 4, // Alterado para 4 para ocupar a largura total
    rowSpan: 1
  },
  {
    id: '2',
    type: 'text',
    title: 'Minha Missão',
    content: 'Especialista em gestão de redes sociais e produção audiovisual. Transformo marcas através de narrativas visuais impactantes e estratégias de engajamento real.',
    colSpan: 2,
    rowSpan: 1
  },
  {
    id: '3',
    type: 'link',
    title: 'Portfólio Completo',
    subtitle: 'Confira meus trabalhos no Drive',
    url: 'https://drive.google.com/drive/folders/1ohAfJ_aybS5bA4FiLDv_MHZtxeC7s3sT?usp=drive_link',
    colSpan: 1,
    rowSpan: 2
  },
  {
    id: '5',
    type: 'image',
    title: '', 
    imageUrl: 'https://lh3.googleusercontent.com/d/16-_jQ5tWWxH9hxXevpRsRTkXCyqmWcSo',
    colSpan: 1,
    rowSpan: 1
  },
  {
    id: '6',
    type: 'map',
    title: 'Localização',
    imageUrl: 'https://lh3.googleusercontent.com/d/1JSQaHYF0Fb0iN_Pj71cDol7x5mX8nd2f',
    colSpan: 1,
    rowSpan: 1
  }
];
