import { VitePlugin } from '@electron-forge/plugin-vite';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { FuseV1Options, FuseVersion } from '@electron/fuses';

const config = {
  packagerConfig: {
    asar: true,
    icon: './assets/icon',
    name: 'ElectronApp',
    executableName: 'electron-app',
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'electron_app',
        authors: 'Mahendra Parmar',
        description: 'Desktop application with work log and project management',
        setupIcon: './assets/icon.ico',
        iconUrl: 'https://raw.githubusercontent.com/electron/electron/main/shell/browser/resources/win/electron.ico',
        loadingGif: './assets/loading.gif',
        setupExe: 'ElectronAppSetup.exe',
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['win32'],
      config: {},
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          maintainer: 'Mahendra Parmar',
          homepage: 'https://your-website.com',
          icon: './assets/icon.png',
          categories: ['Utility', 'Office'],
        },
      },
    },
    {
      name: '@electron-forge/maker-dmg',
      platforms: ['darwin'],
      config: {
        format: 'ULFO',
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
      config: {},
    },
  ],
  plugins: [
    new VitePlugin({
      build: [
        { entry: 'src/main.ts', config: 'vite.main.config.mjs', target: 'main' },
        { entry: 'src/preload.ts', config: 'vite.preload.config.mjs', target: 'preload' },
      ],
      renderer: [
        { name: 'main_window', config: 'vite.renderer.config.mjs' },
      ],
    }),
    // Optional FusesPlugin, uncomment if needed
    // new FusesPlugin({
    //   version: FuseVersion.V1,
    //   [FuseV1Options.RunAsNode]: false,
    //   [FuseV1Options.EnableCookieEncryption]: true,
    //   [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
    //   [FuseV1Options.EnableNodeCliInspectArguments]: false,
    //   [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
    //   [FuseV1Options.OnlyLoadAppFromAsar]: true,
    // }),
  ],
};

export default config;
