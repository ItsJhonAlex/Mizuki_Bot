import { execSync } from 'child_process';
import { Logger } from './Logger';

export interface GitCommit {
    hash: string;
    shortHash: string;
    message: string;
    author: string;
    date: string;
    branch: string;
}

export class GitInfo {
    private logger: Logger;

    constructor() {
        this.logger = new Logger();
    }

    getLastCommit(): GitCommit | null {
        try {
            // Get last commit information
            const hash = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
            const shortHash = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
            const message = execSync('git log -1 --pretty=format:"%s"', { encoding: 'utf8' }).trim();
            const author = execSync('git log -1 --pretty=format:"%an"', { encoding: 'utf8' }).trim();
            const date = execSync('git log -1 --pretty=format:"%ad" --date=format:"%Y-%m-%d %H:%M:%S"', { encoding: 'utf8' }).trim();
            const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();

            return {
                hash,
                shortHash,
                message,
                author,
                date,
                branch
            };
        } catch (error) {
            this.logger.error('❌ Error getting git information:', error);
            return null;
        }
    }

    getCommitHistory(limit: number = 5): GitCommit[] {
        try {
            const commits: GitCommit[] = [];
            
            for (let i = 0; i < limit; i++) {
                const hash = execSync(`git rev-parse HEAD~${i}`, { encoding: 'utf8' }).trim();
                const shortHash = execSync(`git rev-parse --short HEAD~${i}`, { encoding: 'utf8' }).trim();
                const message = execSync(`git log -1 --pretty=format:"%s" HEAD~${i}`, { encoding: 'utf8' }).trim();
                const author = execSync(`git log -1 --pretty=format:"%an" HEAD~${i}`, { encoding: 'utf8' }).trim();
                const date = execSync(`git log -1 --pretty=format:"%ad" --date=format:"%Y-%m-%d %H:%M:%S" HEAD~${i}`, { encoding: 'utf8' }).trim();
                const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();

                commits.push({
                    hash,
                    shortHash,
                    message,
                    author,
                    date,
                    branch
                });
            }

            return commits;
        } catch (error) {
            this.logger.error('❌ Error getting commit history:', error);
            return [];
        }
    }

    getRepositoryInfo() {
        try {
            const remoteUrl = execSync('git config --get remote.origin.url', { encoding: 'utf8' }).trim();
            const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
            
            return {
                remoteUrl,
                branch,
                isGitRepo: true
            };
        } catch (error) {
            this.logger.warn('⚠️ Not a git repository or git not available');
            return {
                remoteUrl: null,
                branch: 'unknown',
                isGitRepo: false
            };
        }
    }

    formatCommitMessage(message: string): string {
        // Parse conventional commits
        const conventionalCommitRegex = /^(\w+)(\(.+\))?: (.+)$/;
        const match = message.match(conventionalCommitRegex);
        
        if (match) {
            const [, type, scope, description] = match;
            const scopeText = scope ? ` **${scope.slice(1, -1)}**` : '';
            
            const typeEmoji = this.getTypeEmoji(type || '');
            return `${typeEmoji} **${(type || '').toUpperCase()}**${scopeText}: ${description || ''}`;
        }
        
        return `📝 ${message}`;
    }

    private getTypeEmoji(type: string): string {
        switch (type.toLowerCase()) {
            case 'feat': return '✨';
            case 'fix': return '🐛';
            case 'docs': return '📚';
            case 'style': return '💄';
            case 'refactor': return '♻️';
            case 'test': return '🧪';
            case 'chore': return '🔧';
            case 'perf': return '⚡';
            case 'ci': return '👷';
            case 'build': return '📦';
            case 'revert': return '⏪';
            default: return '📝';
        }
    }
}
