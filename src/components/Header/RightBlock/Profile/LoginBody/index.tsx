import { useState, useMemo } from "preact/hooks";
import { Button, Checkbox } from "@components";
import { config } from "@config";
import styles from "./index.module.css";

interface AgreementState {
    terms: boolean;
    rules: boolean;
}

export function LoginBody() {
    const [agreement, setAgreement] = useState<AgreementState>({
        terms: false,
        rules: false
    });

    const isAllowed = useMemo(
        () => !Object.values(agreement).includes(false),
        [agreement]
    );

    const updateAgreement = (field: keyof AgreementState, value: boolean) => {
        setAgreement((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <div class={styles.wrapper}>
            <div class={styles.checkboxes}>
                <Checkbox
                    name="terms"
                    onChange={(val) => updateAgreement("terms", val)}
                >
                    Я согласен с{" "}
                    <a
                        href={config.media.help[0] + "/legal/privacy"}
                        target="_blank"
                    >
                        Политикой конфиденциальности
                    </a>{" "}
                    и{" "}
                    <a
                        href={config.media.help[0] + "/legal/terms"}
                        target="_blank"
                    >
                        Условиями использования
                    </a>
                </Checkbox>
                <Checkbox
                    name="rules"
                    onChange={(val) => updateAgreement("rules", val)}
                >
                    Я согласен с{" "}
                    <a href={config.media.help[0] + "/rules"} target="_blank">
                        Правилами PixelBattle
                    </a>
                </Checkbox>
            </div>

            <Button href="/login" disabled={!isAllowed}>
                Войти
            </Button>
        </div>
    );
}
