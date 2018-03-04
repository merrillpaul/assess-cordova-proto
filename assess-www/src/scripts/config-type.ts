export interface IConfig {
  centralEndpoint?: string;
  centralContext?: string;
  config?: string;
  branch?: string;
}

export interface IEnvironment {
  beta1: IConfig;
  dev: IConfig;
  int: IConfig;
  localdev: IConfig;
  ppe: IConfig;
  prod: IConfig;
  qa: IConfig;
  test: IConfig;
}
