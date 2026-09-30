export const url = (path = '') =>
  `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
export const repository = import.meta.env.PUBLIC_REPOSITORY_URL || '';
export const githubUrl = () => repository || url('about/#open-source');
