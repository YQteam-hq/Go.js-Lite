import common from './common';
import auth from './auth';
import dashboard from './dashboard';
import files from './files';
import database from './database';
import security from './security';
import system from './system';
import settings from './settings';
import backup from './backup';
import ftp from './ftp';
import users from './users';
import web from './web';
import php from './php';

const zh = {
  ...common,
  ...auth,
  ...dashboard,
  ...files,
  ...database,
  ...security,
  ...system,
  ...settings,
  ...backup,
  ...ftp,
  ...users,
  ...web,
  ...php,
};

export type Translation = typeof zh;
export default zh;
