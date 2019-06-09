// @flow strict-local

import {Transformer} from '@parcel/plugin';
import localRequire from '@parcel/local-require';
import * as ts from 'typescript';
import formatDiagnostics from './formatDiagnostics';
import LanguageServiceHost from './LanguageServiceHost';

export default new Transformer({
  async getConfig({asset}) {
    return asset.getConfig(['tsconfig.json']);
  },

  async transform({asset, config, options}) {
    // let ts = await localRequire('typescript', asset.filePath);

    // options.projectRoot should be dir of tsconfig... I guess idk
    let tsConfig = ts.parseJsonConfigFileContent(
      config,
      ts.sys,
      options.projectRoot
    );
    let host = new LanguageServiceHost(tsConfig);
    let langService = ts.createLanguageService(
      host,
      ts.createDocumentRegistry()
    );

    const diagnostics = [
      ...langService.getSemanticDiagnostics(asset.filePath),
      ...langService.getSyntacticDiagnostics(asset.filePath)
    ];

    if (diagnostics.length > 0) {
      const formatted = formatDiagnostics(diagnostics, options.projectRoot);
      throw formatted;
    }

    return [
      {
        type: asset.type,
        code: await asset.getCode()
      }
    ];
  }
});
