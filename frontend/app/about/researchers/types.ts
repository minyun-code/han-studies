export type Researchers = {
  id: number;
  name: string;
  nameKana: string;
  title: string;
  department: string;
  profileLink?: string;
  researchField?:string;
  positionType?: "A_所長" | "B_副所長" | "C_研究所員" | "D_招聘研究員";
  order?:number;
};
