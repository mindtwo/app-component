import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createManifestLoader } from '../src/util/create-manifest-loader';
import type { PluginOptions } from 'app-component-plugin';

describe('manifest loader', () => {
    let mockBuilderContext: any;
    let mockOptions: PluginOptions;
    let mockTemplate: string;

    beforeEach(() => {
        mockBuilderContext = {
            emitFile: vi.fn()
        };

        mockOptions = {
            manifestLoader: true,
            name: 'test-app',
            enforce: 'post',
            basePath: '/'
        };

        mockTemplate = `
const load = async () => {
    const manifestUrl = __MANIFEST_URL__;
    const basePath = __BASE_PATH__;
    
    async function fetchManifest() {
        const response = await fetch(manifestUrl);
        return await response.json();
    }
    
    async function loadFromManifest() {
        const manifest = await fetchManifest();
        const entries = Object.values(manifest).filter((entry) => entry.isEntry);
        // Loading logic here
    }
    
    loadFromManifest().then(() => {
        console.log('Manifest loaded successfully');
    }).catch(() => {
        // Silent error handling
    });
};

winLoad(async function () {
    await load();
});`;
    });

    it('should not create loader when manifestLoader is falsy', () => {
        const options = { ...mockOptions, manifestLoader: false };
        
        createManifestLoader(mockBuilderContext, options, mockTemplate);
        
        expect(mockBuilderContext.emitFile).not.toHaveBeenCalled();
    });

    it('should create loader with template replacement', () => {
        createManifestLoader(mockBuilderContext, mockOptions, mockTemplate);

        expect(mockBuilderContext.emitFile).toHaveBeenCalledWith({
            type: 'asset',
            name: 'manifest-loader',
            fileName: 'test-app-loader.js',
            source: expect.stringContaining('"manifest.json"')
        });

        const emittedSource = mockBuilderContext.emitFile.mock.calls[0][0].source;
        expect(emittedSource).toContain('const manifestUrl = "manifest.json"');
        expect(emittedSource).toContain('const basePath = "/"');
        expect(emittedSource).toContain('async function fetchManifest()');
    });

    it('should use custom manifest URL when provided', () => {
        const options = { ...mockOptions, manifestUrl: 'custom/path/manifest.json' };
        
        createManifestLoader(mockBuilderContext, options, mockTemplate);

        const emittedSource = mockBuilderContext.emitFile.mock.calls[0][0].source;
        expect(emittedSource).toContain('const manifestUrl = "custom/path/manifest.json"');
    });

    it('should use default filename when manifestLoader is true and no name provided', () => {
        const options = { ...mockOptions, name: undefined, manifestLoader: true };

        createManifestLoader(mockBuilderContext, options, mockTemplate);

        expect(mockBuilderContext.emitFile).toHaveBeenCalledWith({
            type: 'asset',
            name: 'manifest-loader',
            fileName: 'manifest-loader.js',
            source: expect.any(String)
        });

        const emittedSource = mockBuilderContext.emitFile.mock.calls[0][0].source;
        expect(emittedSource).toContain('Object.values(manifest).filter((entry) => entry.isEntry)');
    });

    it('should use custom filename when manifestLoader is a string', () => {
        const options = { ...mockOptions, manifestLoader: 'custom-loader' };

        createManifestLoader(mockBuilderContext, options, mockTemplate);

        expect(mockBuilderContext.emitFile).toHaveBeenCalledWith({
            type: 'asset',
            name: 'manifest-loader',
            fileName: 'custom-loader.js',
            source: expect.any(String)
        });
    });

    it('should add .js extension if not present in custom filename', () => {
        const options = { ...mockOptions, manifestLoader: 'custom-loader.js' };

        createManifestLoader(mockBuilderContext, options, mockTemplate);

        expect(mockBuilderContext.emitFile).toHaveBeenCalledWith({
            type: 'asset',
            name: 'manifest-loader',
            fileName: 'custom-loader.js',
            source: expect.any(String)
        });
    });

    it('should generate valid JavaScript loader content', () => {
        createManifestLoader(mockBuilderContext, mockOptions, mockTemplate);

        const emittedSource = mockBuilderContext.emitFile.mock.calls[0][0].source;
        
        // Check that the generated content has the expected structure
        expect(emittedSource).toContain('const load = async () => {');
        expect(emittedSource).toContain('const manifestUrl = "manifest.json"');
        expect(emittedSource).toContain('const basePath = "/"');
        expect(emittedSource).toContain('async function fetchManifest()');
        expect(emittedSource).toContain('async function loadFromManifest()');
        expect(emittedSource).toContain('winLoad(async function () {');
    });

    it('should use custom base path when provided', () => {
        const options = { ...mockOptions, basePath: '/custom/base/' };

        createManifestLoader(mockBuilderContext, options, mockTemplate);

        const emittedSource = mockBuilderContext.emitFile.mock.calls[0][0].source;
        expect(emittedSource).toContain('const basePath = "/custom/base/"');
    });

    it('should handle template without placeholders gracefully', () => {
        const simpleTemplate = 'console.log("simple template");';
        
        createManifestLoader(mockBuilderContext, mockOptions, simpleTemplate);

        const emittedSource = mockBuilderContext.emitFile.mock.calls[0][0].source;
        expect(emittedSource).toBe('console.log("simple template");');
    });

    it('should replace both manifest URL and base path placeholders', () => {
        const options = { ...mockOptions, manifestUrl: 'api/manifest.json', basePath: '/app/' };
        
        createManifestLoader(mockBuilderContext, options, mockTemplate);

        const emittedSource = mockBuilderContext.emitFile.mock.calls[0][0].source;
        expect(emittedSource).toContain('const manifestUrl = "api/manifest.json"');
        expect(emittedSource).toContain('const basePath = "/app/"');
    });
});