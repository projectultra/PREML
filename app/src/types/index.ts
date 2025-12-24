export interface GalaxyDetailsInterface {
    object_id: string;
    ra: number | null;
    dec: number | null;
    g_mag: number | null;
    r_mag: number | null;
    i_mag: number | null;
    z_mag: number | null;
    y_mag: number | null;
    redshift: number | null;
    morphology: string | null;
}

export interface CutoutImage {
    url: string;
    filter: string;
    error?: string;
}

export interface MagnitudeValues {
    g: number;
    r: number;
    i: number;
    z: number;
    y: number;
}
