export type FindByUserParams = {
    user_id: number;
    shouldFilterActives?: boolean;
};

export type FindByMovieParams = {
    movie_id: number;
    shouldFilterActives?: boolean;
};

export type FindByMovieAndUserParams = {
    movie_id: number;
    user_id: number;
    shouldFilterActives?: boolean;
};

export interface MovieHistory {
    id: number;
    movie_id: number;
    user_id: number;
    return_date: Date;
    returned: number;
    action: string;
    created_at: Date;
}
