var  _ = require('lodash'),
    container = require('../../container.js');

module.exports = {
    formatIssueFromGitlab: function(issue) {
		var regExCol = new RegExp("^" + container.get('config').column_prefix),
			regExTheme = new RegExp("^" + container.get('config').theme_prefix),
			regExSort = new RegExp("^" + container.get('config').sort_prefix);

		issue = _.pick(issue, ['id', 'iid', 'title', 'created_at', 'updated_at', 'assignee', 'author', 'labels', 'milestone', 'state', 'description', 'project', 'namespace']);
        issue.column = null;
		issue.theme = null;
		issue.sort = 999999;
        issue.starred = false;

        (issue.labels || []).forEach(function(label, key) {
                if (regExCol.test(label)) {
                    issue.column = label.replace(regExCol, '');
                    delete issue.labels[key];
                }

                if (regExTheme.test(label)) {
                    issue.theme = label.replace(regExTheme, '');
                    delete issue.labels[key];
                }

				if (regExSort.test(label)) {
					issue.sort = label.replace(regExSort, '');
					delete issue.labels[key];
				}

                if (label === container.get('config').board_prefix + 'starred') {
                    issue.starred = true;
                    delete issue.labels[key];
                }
            });

        issue.labels = issue.labels.filter(function(v) { return v && v.length > 0; });

        return issue;
    },

    formatIssueToGitlab: function(issue) {
        if (issue.labels.split) {
            issue.labels = issue.labels.split(',');
        }

        if (issue.column && issue.labels.indexOf(container.get('config').column_prefix + issue.column) === -1) {
            issue.labels.push(container.get('config').column_prefix + issue.column);
        }

        if (issue.theme && issue.labels.indexOf(container.get('config').theme_prefix + issue.theme) === -1) {
            issue.labels.push(container.get('config').theme_prefix + issue.theme);
        }

        if (issue.starred && issue.labels.indexOf('board:starred') === -1) {
            issue.labels.push('board:starred');
        }

        if (issue.labels.length === 0) {
            issue.labels = [''];
        }

        if (issue.labels.join) {
            issue.labels = issue.labels.join(',');
        }

		delete(issue.project);
		delete(issue.namespace);

        return issue;
    },

    formatProjectFromGitlab: function(project) {
        project.access_level = 10;

        if (project.permissions) {
            var access = project.permissions.project_access || {};

            if (access.access_level > project.access_level) {
                project.access_level = access.access_level;
            }

            access =  project.permissions.group_access || {};

            if (access.access_level > project.access_level) {
                project.access_level = access.access_level;
            }
        }

        return _.pick(project, ['path_with_namespace', 'description', 'last_activity_at', 'id', 'access_level']);
    }
};
