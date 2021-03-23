import React, { ChangeEvent } from "react";
import {
  Button,
  Stack,
  Box,
  useToast,
  VStack,
  useDisclosure,
  Collapse,
  HStack,
  Heading,
  Input,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  Text,
  Spinner,
} from "@chakra-ui/react";
import { FiExternalLink } from "react-icons/fi";
import { ethers } from "ethers";
import { Stage, Image, Layer, Line } from "react-konva";
import { CirclePicker } from "react-color";
import { formatAddress } from "../helpers/helpers";
import GlobalContext from "../contextx/globalContext";
import ProtonAbi from "../contracts/Proton.json";

const protonAddress = "0xD4F7389297d9cea850777EA6ccBD7Db5817a12b2";

type NftAttribute = {
  name: string;
  value: string;
};

type SignatureData = {
  address: string;
  message: string;
  signature: string;
};
type NftMetadata = {
  description?: string;
  external_url?: string;
  animation_url?: string;
  youtube_url?: string;
  icon?: string;
  image: string;
  thumbnail: string;
  name: string;
  symbol?: string;
  decimals?: number;
  background_color?: string;
  attributes?: NftAttribute[];
  creatorAnnuity?: number;
  particleType?: string;
  timestamp?: number;
  signatures: SignatureData[];
};

const STAGE_DIMENSION = 300;

const FileUploader = () => {
  const { state } = React.useContext(GlobalContext);
  const [photo, setPhoto] = React.useState<any>();
  const toast = useToast();
  const [autographedImage, setAutographedImage] = React.useState<any>();
  const [tool, setTool] = React.useState("pen");
  const [lines, setLines] = React.useState<any>([]);
  const isDrawing = React.useRef(false);
  const stageRef = React.useRef(null);
  const [imageSize, setImageSize] = React.useState({
    width: 300,
    height: 300,
  });
  const [color, setColor] = React.useState("#df4b26");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [txn, setTxn] = React.useState<any>();
  const [txnConfirmation, setConfirmation] = React.useState(false);
  const [autographHash, setHash] = React.useState("");
  const [metadata, setMetadata] = React.useState<NftMetadata>({
    name: "",
    image: "",
    thumbnail: "",
    signatures: [],
    description: "",
  });

  React.useEffect(() => {
    if (photo && photo.width) {
      let aspectRatio = photo.width / photo.height;
      let newSize = { width: 0, height: 0 };
      console.log(aspectRatio);
      if (aspectRatio >= 1) {
        newSize.width = STAGE_DIMENSION;
        newSize.height = STAGE_DIMENSION / aspectRatio;
      } else {
        newSize.width = STAGE_DIMENSION * aspectRatio;
        newSize.height = STAGE_DIMENSION;
      }
      console.log(newSize);
      setImageSize(newSize);
    }
  }, [photo]);

  React.useEffect(() => {
    if (photo) {
      console.log(photo.width);
      onOpen();
    }
  }, [photo]);

  const handleMouseDown = (e: any) => {
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    //@ts-ignore
    setLines([...lines, { tool, points: [pos.x, pos.y] }]);
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing.current) {
      return;
    }
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    let lastLine = lines[lines.length - 1];

    //@ts-ignore
    lastLine.points = lastLine.points.concat([point.x, point.y]);

    lines.splice(lines.length - 1, 1, lastLine);
    setLines(lines.concat());
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  const handleFileClick = () => {
    var fileInputEl = document.createElement("input");
    fileInputEl.type = "file";
    fileInputEl.accept = "image/*";
    fileInputEl.style.display = "none";
    document.body.appendChild(fileInputEl);
    fileInputEl.addEventListener("input", function (e) {
      handleUpload(e as any);
      document.body.removeChild(fileInputEl);
    });
    fileInputEl.click();
  };

  const handleIPFSGrab = async () => {
    try {
      let metadata = await (
        await fetch(`https://ipfs.io/ipfs/${autographHash}`)
      ).json();
      setMetadata(metadata);
      let image = await (await fetch(metadata.image)).blob();
      console.log(image);
      let reader = new FileReader();
      reader.onload = function () {
        let img = new window.Image();
        //@ts-ignore
        img.src = reader.result;
        setPhoto(img);
      };
      reader.readAsDataURL(new File([image], "autograph.png"));
    } catch (err) {
      console.log(err);
      toast({
        position: "top",
        status: "error",
        title: "Something went wrong",
        description: err.toString(),
        duration: 5000,
      });
    }
  };

  const handleUpload = async (evt: ChangeEvent<HTMLInputElement>) => {
    let files = evt.target.files;
    let reader = new FileReader();
    if (files && files.length > 0) {
      reader.onload = function () {
        let img = new window.Image();
        //@ts-ignore
        img.src = reader.result;
        setPhoto(img);
      };
      reader.readAsDataURL(files[0]);
    }
  };

  function dataURItoBlob(dataURI: string) {
    // convert base64 to raw binary data held in a string
    var byteString = atob(dataURI.split(",")[1]);

    // separate out the mime component
    var mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];

    // write the bytes of the string to an ArrayBuffer
    var arrayBuffer = new ArrayBuffer(byteString.length);
    var _ia = new Uint8Array(arrayBuffer);
    for (var i = 0; i < byteString.length; i++) {
      _ia[i] = byteString.charCodeAt(i);
    }

    var dataView = new DataView(arrayBuffer);
    var blob = new Blob([dataView], { type: mimeString });
    return blob;
  }

  const autographPhoto = async () => {
    //@ts-ignore
    let img = stageRef.current!.toDataURL();
    setAutographedImage(img);
    setPhoto(undefined);
    setLines([]);
    onClose();
    try {
      let blob = dataURItoBlob(img);
      if (state.ipfs) {
        let added = await state.ipfs.add(blob, {});
        let nftMetadata = metadata;
        if (metadata.image === "") {
          let initialMetadata = {
            description: metadata.description,
            image: `https://ipfs.io/ipfs/${added.path}`,
            thumbnail: `https://ipfs.io/ipfs/${added.path}`,
            name: metadata.description,
            symbol: "PROTON",
            decimals: 18,
            background_color: "FFF",
            attributes: [
              { name: "Medium", value: "Digital photograph and digital ink" },
              {
                name: "Dimensions",
                value: `${imageSize.width} px x ${imageSize.height} px`,
              },
              { name: "Proof of Ownership", value: "Transaction Hash" },
              { name: "Edition", value: "1 of 1" },
            ],
            creatorAnnuity: 5,
            particleType: "proton",
            signatures: [] as SignatureData[],
          };
          setMetadata(initialMetadata as NftMetadata);
          nftMetadata = Object.assign(initialMetadata);
        } else {
          nftMetadata = {
            ...nftMetadata,
            image: `https://ipfs.io/ipfs/${added.path}`,
            thumbnail: `https://ipfs.io/ipfs/${added.path}`,
          };
        }

        let signer = await state.web3!.getSigner();
        const message = `I autographed this message at ${Date.now()}`;
        let signature = await signer.signMessage(message);
        nftMetadata.signatures.push({
          address: await signer.getAddress(),
          message: message,
          signature: signature,
        });
        console.log(nftMetadata);
        added = await state.ipfs.add(JSON.stringify(nftMetadata), {});
        console.log("ipfs hash", added.path);
        setHash(added.path);
      }
    } catch (error) {
      console.error(error);
      toast({
        position: "top",
        status: "error",
        title: "Something went wrong",
        description: error.toString(),
        duration: 5000,
      });
    }
  };

  const mintNft = async () => {
    try {
      let signer = await state.web3!.getSigner();
      let tokenUri = `https://gateway.ipfs.io/ipfs/${autographHash}`;
      let signerAddress = await signer.getAddress();
      if (state.chain === 42) {
        const protonContract = new ethers.Contract(
          protonAddress,
          ProtonAbi,
          signer
        );
        const res = await protonContract.functions.createProton(
          signerAddress,
          signerAddress,
          tokenUri,
          5
        );
        setTxn(res);
        console.log(res);
        res.wait().then((res: any) => setConfirmation(true));
      } else
        toast({
          position: "top",
          status: "error",
          title: "Wrong Network",
          description: "Your wallet is connected to an unsupported network",
          duration: 5000,
        });
    } catch (error) {
      console.error(error);
      toast({
        position: "top",
        status: "error",
        title: "Something went wrong",
        description: error.toString(),
        duration: 5000,
      });
    }
    setPhoto(undefined);
  };

  const handleColorChange = (color: any) => {
    setColor(color.hex);
  };

  return (
    <Box>
      <Stack align="center">
        <VStack>
          <Button w="200px" onClick={handleFileClick}>
            Select Image from Device
          </Button>
          <Input
            placeholder="IPFS Autograph Hash"
            value={autographHash}
            onChange={(evt) => setHash(evt.target.value)}
          />
          <Button w="200px" onClick={handleIPFSGrab}>
            Load Autograph from IPFS
          </Button>
          <Collapse in={isOpen} animateOpacity>
            <VStack>
              <Heading size="sm">Sign Below</Heading>
              <Stage
                width={imageSize.width}
                height={imageSize.height}
                onMouseDown={handleMouseDown}
                onMousemove={handleMouseMove}
                onMouseup={handleMouseUp}
                ref={stageRef}
                onTouchStart={handleMouseDown}
                onTouchMove={handleMouseMove}
                onTouchEnd={handleMouseUp}
              >
                <Layer>
                  <Image
                    image={photo}
                    width={imageSize.width}
                    height={imageSize.height}
                  />
                </Layer>
                <Layer>
                  {lines.map((line: any, i: any) => (
                    <Line
                      key={i}
                      points={line.points}
                      stroke={color}
                      strokeWidth={5}
                      tension={0.5}
                      lineCap="round"
                      globalCompositeOperation={
                        line.tool === "eraser"
                          ? "destination-out"
                          : "source-over"
                      }
                    />
                  ))}
                </Layer>
              </Stage>
              <Input
                value={metadata.name}
                placeholder="Name this NFT"
                onChange={(evt) =>
                  setMetadata({ ...metadata, name: evt.target.value })
                }
              />
              <Input
                value={metadata.description}
                placeholder="Describe this NFT"
                onChange={(evt) =>
                  setMetadata({ ...metadata, description: evt.target.value })
                }
              />
              <HStack>
                <Popover>
                  <PopoverTrigger>
                    <Button>Change Autograph Color</Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <PopoverArrow />
                    <PopoverCloseButton />
                    <PopoverHeader>Pick Color</PopoverHeader>
                    <PopoverBody>
                      <CirclePicker onChangeComplete={handleColorChange} />
                    </PopoverBody>
                  </PopoverContent>
                </Popover>
                <Button onClick={() => setLines([])}>Clear Autograph</Button>
              </HStack>
              <Button onClick={autographPhoto}>Autograph NFT</Button>
              {metadata.signatures.length > 0 && metadata.signatures.map((signature) => {
                return (
                  <HStack>
                    <Text>Verified Signatures {formatAddress(ethers.utils.verifyMessage(signature.message, signature.signature))}</Text>
                  </HStack>
                )
              })}
            </VStack>
          </Collapse>
          <Button
            w="200px"
            isDisabled={!autographedImage || !state.address}
            onClick={mintNft}
          >
            Mint NFT
          </Button>
          {txn && (
            <HStack>
              <Text>{formatAddress(txn.hash)}</Text>
              {!txnConfirmation ? (
                <Spinner />
              ) : (
                <HStack
                  onClick={() =>
                    window.open(
                      `https://kovan.etherscan.io/tx/${txn.hash}`,
                      "_blank"
                    )
                  }
                  cursor="pointer"
                >
                  <Text color="green">Confirmed!</Text>
                  <FiExternalLink />
                </HStack>
              )}
            </HStack>
          )}
        </VStack>
      </Stack>
    </Box>
  );
};

export default FileUploader;
