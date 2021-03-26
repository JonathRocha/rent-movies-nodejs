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

export type ListByMovieParams = {
    movie_id: number;
    limit?: number;
    page?: number;
    shouldFilterActives?: boolean;
};

export interface HistoryCreation {
    rent_id: number;
    action: string;
}

export interface MovieHistory {
    id: number;
    movie_id: number;
    user_id: number;
    return_date: Date;
    returned: number;
    action: string;
    created_at: Date;
}

export interface MovieHistoryToList {
    username: string;
    movieName: string;
    action: string;
    created_at: Date;
}
