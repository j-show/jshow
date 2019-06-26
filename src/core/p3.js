/**
 * ==========================================
 * Name:           jShow's P3 code model
 * Author:         j-show
 * CreTime:        2019-05-15
 * Description:    jShow's Project-Profile-Plugin
 * Log:
 * 2019-05-15    Init Library
 * 2019-06-21    Format Code to jShow Style Guide
 * ==========================================
 */
($ => {
	const TProjectManage = (function (TObject) {
		const projects = [];
		const profiles = [];

		class TProjectManage extends TObject {
			create (cfg) {
				this.__projects = [];
				this.__profiles = [];
			}

			use (project, ...arg) {
				if (project instanceof TProject) {
					if (arg.length > 0) project.use(...arg);
					projects.push(project);
				}

				return this;
			}

		}

		return TProjectManage;
	})($.TObject);

	const TProject = (function (TObject) {
		class TProject extends TObject {
			create () {

			}

			use;
		}

		return TProject;
	})($.TObject);

	const TProfile = (function (TObject) {
		class TProfile extends TObject {
			create () {
				this.__plugin = [];
			}

			use (plugin) {
				if (plugin instanceof TPlugin) return this;

				this.__plugin.push(plugin);

				return this;
			}
		}

		return TProfile;
	})($.TObject);

	const TPlugin = (function (TObject) {
		class TPlugin extends TObject {
			create () {

			}
		}

		return TPlugin;
	})($.TObject);

	const api = {
		TProject,
		TProfile,
		TPlugin,
		InitP3 (cfg) {
			const $ = jShow;

			let pm = $.ProjectManage || TProjectManage.create(cfg);

			$.ProjectManage = pm;

			return pm;
		}
	};

	jShow = {...$, ...api};
	$     = jShow;
})(jShow);