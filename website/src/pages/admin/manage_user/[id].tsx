import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  useToast,
} from "@chakra-ui/react";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Head from "next/head";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useForm } from "react-hook-form";
import { UserStats } from "src/components/Account/UserStats";
import { AdminArea } from "src/components/AdminArea";
import { JsonCard } from "src/components/JsonCard";
import { AdminLayout } from "src/components/Layout";
import { AdminMessageTable } from "src/components/Messages/AdminMessageTable";
import { Role, RoleSelect } from "src/components/RoleSelect";
import { post } from "src/lib/api";
import { get } from "src/lib/api";
import { getValidDisplayName } from "src/lib/display_name_validation";
import { userlessApiClient } from "src/lib/oasst_client_factory";
import prisma from "src/lib/prismadb";
import { getFrontendUserIdForUser } from "src/lib/users";
import { LeaderboardEntity, LeaderboardTimeFrame } from "src/types/Leaderboard";
import { AuthMethod } from "src/types/Providers";
import { User } from "src/types/Users";
import uswSWRImmutable from "swr/immutable";
import useSWRMutation from "swr/mutation";

interface UserForm {
  user_id: string;
  id: string;
  auth_method: AuthMethod;
  display_name: string;
  role: Role;
  currentLifestyleDiet: string;
  age: number;
  gender: string;
  ethnicity: string;
  country: string;
  educationLevel: string;
  incomeLevel: number;
  incomeCurrency: string;
  politicalAffiliation: string;
  religiousAffiliation: string;
  advocateForAnimals: string;
  rolesInAnimalAdvocacy: string;
  abolitionistVsIncrementalistApproach: number;
  institutionalVsIndividualFocus: number;
  intersectionalVsAnimalActivismFocus: number;
  welfareVsRightsFocus: number;
  confrontationalVsDiplomaticActivism: number;
  intuitiveVsEmpiricalEffectivenessJudgement: number;
  show_on_leaderboard: boolean;
}

const ManageUser = ({ user }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const toast = useToast();

  const { data: stats } = uswSWRImmutable<Partial<{ [time in LeaderboardTimeFrame]: LeaderboardEntity }>>(
    "/api/user_stats?" +
    new URLSearchParams({ id: user.id, auth_method: user.auth_method, display_name: user.display_name }),
    get,
    {
      fallbackData: {},
    }
  );

  // Trigger to let us update the user's role.  Triggers a toast when complete.
  const { trigger } = useSWRMutation("/api/admin/update_user", post, {
    onSuccess: () => {
      toast({
        title: "Updated user",
        status: "success",
        duration: 1000,
        isClosable: true,
      });
    },
    onError: () => {
      toast({
        title: "User Role update failed",
        status: "error",
        duration: 1000,
        isClosable: true,
      });
    },
  });

  const { register, handleSubmit } = useForm<UserForm>({
    defaultValues: user,
  });

  const reformatData = (data) => {
    const notes = {
      currentLifestyleDiet: data.currentLifestyleDiet,
      demographics: {
        age: data.age,
        gender: data.gender,
        ethnicity: data.ethnicity,
        country: data.country,
        educationLevel: data.educationLevel,
        incomeLevel: data.incomeLevel,
        incomeCurrency: data.incomeCurrency,
        politicalAffiliation: data.politicalAffiliation,
        religiousAffiliation: data.religiousAffiliation
      },
      involvementInAnimalAdvocacy: {
        advocateForAnimals: data.advocateForAnimals,
        rolesInAnimalAdvocacy: data.rolesInAnimalAdvocacy,
        personalApproachRating: {
          abolitionistVsIncrementalistApproach: data.abolitionistVsIncrementalistApproach,
          institutionalVsIndividualFocus: data.institutionalVsIndividualFocus,
          intersectionalVsAnimalActivismFocus: data.intersectionalVsAnimalActivismFocus,
          welfareVsRightsFocus: data.welfareVsRightsFocus,
          confrontationalVsDiplomaticActivism: data.confrontationalVsDiplomaticActivism,
          intuitiveVsEmpiricalEffectivenessJudgement: data.intuitiveVsEmpiricalEffectivenessJudgement
        }
      }
    };

    // Convert the notes object to a JSON string
    const notesJson = JSON.stringify(notes);

    const newData = {
      displayName: data.display_name,
      role: data.role,
      show_on_leaderboard: data.show_on_leaderboard,
      notes: notesJson,
    }
    return newData
  }

  return (
    <>
      <Head>
        <title>Manage Users - Open Assistant</title>
        <meta
          name="description"
          content="Conversational AI for everyone. An open source project to create a chat enabled GPT LLM run by LAION and contributors around the world."
        />
      </Head>
      <AdminArea>
        <Stack gap="4">
          <Card>
            <CardBody>
              <form onSubmit={handleSubmit((data) => trigger((data) => reformatData(data)))}>
                <input type="hidden" {...register("user_id")}></input>
                <input type="hidden" {...register("id")}></input>
                <input type="hidden" {...register("auth_method")}></input>
                <FormControl>
                  <FormLabel>Display Name</FormLabel>
                  <Input {...register("display_name")} />
                </FormControl>
                <FormControl mt="2">
                  <FormLabel>Role</FormLabel>
                  <RoleSelect {...register("role")}></RoleSelect>
                </FormControl>

                  <FormControl mt="2">
                    <FormLabel>What is your current lifestyle/diet?</FormLabel>
                    <Input {...register("currentLifestyleDiet")} />
                </FormControl>
                <Heading as="h2" size="lg" mt="4">Demographics</Heading>
                  <FormControl mt="2">
                    <FormLabel>Current Age</FormLabel>
                    <Input type="number" min="1" max="110" {...register("age")} />
                  </FormControl>
                  <FormControl mt="2">
                    <FormLabel>Gender</FormLabel>
                    <Input {...register("gender")} />
                  </FormControl>
                  <FormControl mt="2">
                    <FormLabel>Ethnicity</FormLabel>
                    <Input {...register("ethnicity")} />
                  </FormControl>
                  <FormControl mt="2">
                    <FormLabel>Country</FormLabel>
                    <Input {...register("country")} />
                  </FormControl>
                  <FormControl mt="2">
                    <FormLabel>Education Level</FormLabel>
                    <Input {...register("educationLevel")} />
                  </FormControl>
                  <FormControl mt="2">
                    <FormLabel>Annual Approximate Income</FormLabel>
                    <Input type="number" min="0" {...register("incomeLevel")} />
                  </FormControl>
                  <FormControl mt="2">
                    <FormLabel>Income Currency</FormLabel>
                    <Input {...register("incomeCurrency")} />
                  </FormControl>
                  <FormControl mt="2">
                    <FormLabel>Political Affiliation</FormLabel>
                    <Input {...register("politicalAffiliation")} />
                  </FormControl>
                  <FormControl mt="2">
                    <FormLabel>Religious Affiliation</FormLabel>
                    <Input {...register("religiousAffiliation")} />
                  </FormControl>
                
                  <Heading as="h2" size="lg" mt="4">Animal Advocacy</Heading>
                  <FormControl mt="2">
                    <FormLabel>Do you consider yourself an advocate for animals?</FormLabel>
                    <Input {...register("advocateForAnimals")} />
                  </FormControl>
                  <FormControl mt="2">
                    <FormLabel>What is your role(s) in animal advocacy? (select all that apply)</FormLabel>
                    <Input {...register("rolesInAnimalAdvocacy")} />
                  </FormControl>
                  <FormControl mt="2">
                    <FormLabel>Abolitionist Approach ↔ Incrementalist Approach</FormLabel>
                      <Input type="range" min="1" max="5" {...register("abolitionistVsIncrementalistApproach")} />
                  </FormControl>
                  <FormControl mt="2">
                    <FormLabel>Institutional Focus ↔ Individual Focus</FormLabel>
                      <Input type="range" min="1" max="5" {...register("institutionalVsIndividualFocus")} />
                  </FormControl>
                  <FormControl mt="2">
                    <FormLabel>Intersectional Approach To Activism ↔ Focused Solely on Animal Activism</FormLabel>
                      <Input type="range" min="1" max="5" {...register("intersectionalVsAnimalActivismFocus")} />
                  </FormControl>
                  <FormControl mt="2">
                    <FormLabel>Focus on Animal Welfare ↔ Focus on Animal Rights</FormLabel>
                      <Input type="range" min="1" max="5" {...register("welfareVsRightsFocus")} />
                  </FormControl>
                  <FormControl mt="2">
                    <FormLabel>Confrontational Activism ↔ Diplomatic Activism</FormLabel>
                      <Input type="range" min="1" max="5" {...register("confrontationalVsDiplomaticActivism")} />
                  </FormControl>
                  <FormControl mt="2">
                    <FormLabel>Intuitive Judgements on Effectiveness ↔ Empirical Judgements on Effectiveness</FormLabel>
                      <Input type="range" min="1" max="5" {...register("intuitiveVsEmpiricalEffectivenessJudgement")} />
                  </FormControl>

                  <FormControl mt="2">
                    <FormLabel>Show on leaderboard</FormLabel>
                    <Checkbox {...register("show_on_leaderboard")}></Checkbox>
                  </FormControl>
                  <Button mt={4} type="submit">
                    Update
                  </Button>
              </form>
              <Accordion allowToggle mt="4">
                <AccordionItem>
                  <AccordionButton>
                    <Box as="span" flex="1" textAlign="left">
                      Raw JSON
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel pb={4}>
                    <JsonCard>{user}</JsonCard>
                  </AccordionPanel>
                </AccordionItem>
              </Accordion>
            </CardBody>
          </Card>
          <Card>
            <CardHeader pb="0" fontWeight="medium" fontSize="xl">
              {`User's messages`}
            </CardHeader>
            <CardBody>
              <AdminMessageTable userId={user.user_id}></AdminMessageTable>
            </CardBody>
          </Card>

          <UserStats title="Statistic" stats={stats}></UserStats>
        </Stack>
      </AdminArea>
    </>
  );
};

/**
 * Fetch the user's data on the server side when rendering.
 */
export const getServerSideProps: GetServerSideProps<{ user: User<Role> }, { id: string }> = async ({
  params,
  locale = "en",
}) => {
  const backend_user = await userlessApiClient.fetch_user(params!.id as string);
  if (!backend_user) {
    return {
      notFound: true,
    };
  }

  let frontendUserId = backend_user.id;
  if (backend_user.auth_method === "discord" || backend_user.auth_method === "google") {
    frontendUserId = await getFrontendUserIdForUser(backend_user.id, backend_user.auth_method);
  }

  const local_user = await prisma.user.findUnique({
    where: { id: frontendUserId },
    select: { role: true, accounts: true, email: true },
  });

  if (!local_user) {
    return {
      notFound: true,
    };
  }

  const user = {
    ...backend_user,
    role: (local_user.role || "general") as Role,
    accounts: local_user.accounts || [],
    email: local_user.email,
  };
  user.display_name = getValidDisplayName(user.display_name, user.id);

  return {
    props: {
      user,
      ...(await serverSideTranslations(locale, ["common", "message", "leaderboard"])),
    },
  };
};

ManageUser.getLayout = AdminLayout;

export default ManageUser;
