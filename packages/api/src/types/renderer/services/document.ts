import { Optional } from 'utility-types';
import { DocType, type Doc, type DocCategory, type PathItem, type SwitchDocOpts } from '@fe/types';
/**
 * Get absolutePath of document
 * @param doc
 * @returns
 */
export declare function getAbsolutePath(doc: Doc): string;
/**
 * Create a checker to check if a document is current activated document.
 * @returns
 */
export declare function createCurrentDocChecker(): {
    check: () => boolean;
    changed: () => boolean;
    throwErrorIfChanged: () => void;
};
/**
 * Check if the document is a markdown file.
 * @param doc
 * @returns
 */
export declare function isMarkdownFile(doc: Doc): boolean;
export declare function supported(doc: Doc): boolean;
/**
 * Check if the document is out of a repository.
 * @param doc
 * @returns
 */
export declare function isOutOfRepo(doc?: Doc | null): boolean;
/**
 * Determine if the document is encrypted.
 * @param doc
 * @returns
 */
export declare function isEncrypted(doc?: Pick<Doc, 'path' | 'type'> | null): boolean;
/**
 * Determine if it is in the same repository.
 * @param docA
 * @param docB
 * @returns
 */
export declare function isSameRepo(docA: Doc | null | undefined, docB: Doc | null | undefined): boolean | null | undefined;
/**
 * Determine if it is the same document.
 * @param docA
 * @param docB
 * @returns
 */
export declare function isSameFile(docA: PathItem | null | undefined, docB: PathItem | null | undefined): boolean | null | undefined;
/**
 * Determine whether document B is the same as document A or a subordinate to directory A.
 * @param docA
 * @param docB
 * @returns
 */
export declare function isSubOrSameFile(docA: PathItem | null | undefined, docB?: PathItem | null | undefined): boolean | null | undefined;
/**
 * Get file URI.
 * @param doc
 * @returns
 */
export declare function toUri(doc?: PathItem | null): string;
/**
 * Create a document.
 * @param doc
 * @param baseDoc
 * @returns
 */
export declare function createDoc(doc: Pick<Doc, 'repo' | 'path' | 'content'>, baseDoc: Doc): Promise<Doc>;
export declare function createDoc(doc: Optional<Pick<Doc, 'repo' | 'path' | 'content'>, 'path'>, baseDoc?: Doc): Promise<Doc>;
/**
 * Create a dir.
 * @param doc
 * @param baseDoc
 * @returns
 */
export declare function createDir(doc: Pick<Doc, 'repo' | 'path' | 'content'>, baseDoc: Doc): Promise<Doc>;
export declare function createDir(doc: Optional<Pick<Doc, 'repo' | 'path' | 'content'>, 'path'>, baseDoc?: Doc): Promise<Doc>;
/**
 * Duplicate a document.
 * @param originDoc
 * @param newPath
 * @returns
 */
export declare function duplicateDoc(originDoc: Doc, newPath?: string): Promise<void>;
/**
 * Delete a document.
 * @param doc
 * @param skipConfirm
 */
export declare function deleteDoc(doc: PathItem, skipConfirm?: boolean): Promise<void>;
/**
 * Move or rename a document.
 * @param doc
 * @param newPath
 */
export declare function moveDoc(doc: Doc, newPath?: string): Promise<void>;
/**
 * Save a document.
 * @param doc
 * @param content
 */
export declare function saveDoc(doc: Doc, content: string): Promise<void>;
/**
 * Ensure current document is saved.
 */
export declare function ensureCurrentFileSaved(): Promise<void>;
/**
 * Switch document.
 * @param doc
 * @param opts
 */
export declare function switchDoc(doc: Doc | null, opts?: SwitchDocOpts): Promise<void>;
export declare function switchDocByPath(path: string): Promise<void>;
/**
 * Mark document.
 * @param doc
 */
export declare function markDoc(doc: Doc): Promise<void>;
/**
 * Unmark document.
 * @param doc
 */
export declare function unmarkDoc(doc: Doc): Promise<void>;
export declare function getMarkedFiles(): import("@fe/types").FileItem[];
export declare function isMarked(doc: PathItem & {
    type?: Doc['type'];
}): boolean;
/**
 * Open in OS.
 * @param doc
 * @param reveal
 */
export declare function openInOS(doc: PathItem, reveal?: boolean): Promise<void>;
/**
 * Show help file.
 * @param docName
 */
export declare function showHelp(docName: string): Promise<void>;
/**
 * show history versions of document
 * @param doc
 */
export declare function showHistory(doc: Doc): void;
/**
 * hide history panel
 */
export declare function hideHistory(): void;
/**
 * register document category
 * @param docCategory
 */
export declare function registerDocCategory(docCategory: DocCategory): void;
/**
 * remove document category
 * @param category
 */
export declare function removeDocCategory(category: string): void;
/**
 * get all document categories
 * @returns
 */
export declare function getAllDocCategories(): DocCategory[];
/**
 * resolve document type
 * @param filename
 */
export declare function resolveDocType(filename: string): {
    type: DocType;
    category: DocCategory;
} | null | undefined;
