import { Coordinates } from "./Coordinates";
import { Info } from "./Info";
import { useCoordinatesStore } from "@stores";

export const PixelInfo = () => {
    const state = useCoordinatesStore();

    return (
        <>
            <Coordinates coordinates={state.coordinates} empty={!state.info} />
            <Info info={state.info} />
        </>
    );
};
