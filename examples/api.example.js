import API from "./api";
import axios from "axios";
import config from "./config.api";
import createActiveConfig from "../config/config.chart.active-project";
import createTypesConfig from "../config/config.chart.project-types";
import createCompletionConfig from "../config/config.chart.project-completion";

class ProjectsAPI extends API {
    constructor() {
        super();
        this.API_ROUTES = config.projects;
    }

    async downloadGraphs() {
        try {
            const requestPath = `${this.BASE_REQUEST_PATH}/${this.API_ROUTES.graphs}`
            const options = this.createConfig();
            const { data } = await axios.get(requestPath, options);

            return this.normalizeDataGraphs(data);
        } catch (error) {
            const { response } = error;
            this.errorBoundaries(response);
        }
    }

    async downloadProjects(params) {
        try {
            const requestPath = `${this.BASE_REQUEST_PATH}/${this.API_ROUTES.projects}`
            const options = this.createConfig(params);
            const { data } = await axios.get(requestPath, options);
            return data;
        } catch (error) {
            const { response } = error;
            this.errorBoundaries(response);
        }
    }

    async downloadProjectDetail(projectId) {
        try {
            const requestPath = `${this.BASE_REQUEST_PATH}/${this.API_ROUTES.projectDetail(projectId)}`;
            const options = this.createConfig();
            const { data } = await axios.get(requestPath, options);
            return data;
        } catch (error) {
            const { response } = error;
            this.errorBoundaries(response);
        }
    }

    async downloadProjectsOnMap() {
        try {
            const requestPath = `${this.BASE_REQUEST_PATH}/${this.API_ROUTES.projectsOnMap}`;
            const options = this.createConfig();
            const { data } = await axios.get(requestPath, options);
            return data;
        } catch (error) {
            const { response } = error;
            this.errorBoundaries(response);
        }
    }

    normalizeDataGraphs(data) {
        const active = createActiveConfig(data['active']);
        const types = createTypesConfig(data['types']);
        const completion = createCompletionConfig(data['completion']);

        return {
            active,
            types,
            completion
        }
    }
}

export default new ProjectsAPI();
